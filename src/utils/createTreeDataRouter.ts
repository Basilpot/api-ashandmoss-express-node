import express from "express";
import { Request, Response } from "express";
import {
  readTenantData,
  writeTenantData,
  TenantDataField,
} from "./tenantSiteData";
import { adminMiddleware } from "@/middlewares/admin.middleware";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function createTreeDataRouter(
  field: TenantDataField,
  label: string,
  compute?: (req: Request) => Promise<unknown[]>,
): express.Router {
  const router: express.Router = express.Router();

  const load = async (req: Request) => {
    const data = await readTenantData(req, field);
    return {
      items: Array.isArray(data?.items) ? data.items : [],
      version: data?.version ?? "1.0.0",
      updatedAt: data?.updatedAt ?? new Date().toISOString(),
    };
  };

  const fail = (res: Response, action: string) =>
    res.status(500).json({
      success: false,
      error: `Failed to ${action} ${label} data`,
    });

  router.get("/", async (req: Request, res: Response) => {
    try {
      const data = await readTenantData(req, field);
      if (data?.auto && compute) {
        try {
          const autoItems = await compute(req);
          return res.status(200).json({
            success: true,
            data: {
              ...data,
              items: Array.isArray(data.items) ? data.items : [],
              autoItems,
            },
          });
        } catch (err) {
          // ponytail: fall back to stored items rather than failing the nav
          console.error(`Failed to compute auto ${label}:`, err);
          return res.status(200).json({ success: true, data });
        }
      }
      return res.status(200).json({ success: true, data });
    } catch {
      return fail(res, "read");
    }
  });

  router.post("/", adminMiddleware, async (req: Request, res: Response) => {
    try {
      const { items, auto } = req.body;
      if (!items || !Array.isArray(items)) {
        return res.status(400).json({
          success: false,
          error: `Invalid ${label} data. 'items' array is required.`,
        });
      }
      const data = {
        items,
        ...(typeof auto === "boolean" ? { auto } : {}),
        version: "1.0.0",
        updatedAt: new Date().toISOString(),
      };
      await writeTenantData(req, field, data);
      return res
        .status(200)
        .json({ success: true, data, message: `${cap(label)} updated successfully` });
    } catch {
      return fail(res, "update");
    }
  });

  router.put("/:id", adminMiddleware, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const data = await load(req);

      const updateItem = (items: any[], targetId: string): boolean => {
        for (let i = 0; i < items.length; i++) {
          if (items[i].id === targetId) {
            items[i] = { ...items[i], ...updates };
            return true;
          }
          if (items[i].children && items[i].children.length > 0) {
            if (updateItem(items[i].children, targetId)) return true;
          }
        }
        return false;
      };

      if (!updateItem(data.items, id!)) {
        return res
          .status(404)
          .json({ success: false, error: `${cap(label)} item not found` });
      }
      data.updatedAt = new Date().toISOString();
      await writeTenantData(req, field, data);
      return res
        .status(200)
        .json({
          success: true,
          data,
          message: `${cap(label)} item updated successfully`,
        });
    } catch {
      return fail(res, "update");
    }
  });

  router.delete("/:id", adminMiddleware, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = await load(req);

      const deleteItem = (items: any[], targetId: string): boolean => {
        for (let i = 0; i < items.length; i++) {
          if (items[i].id === targetId) {
            items.splice(i, 1);
            return true;
          }
          if (items[i].children && items[i].children.length > 0) {
            if (deleteItem(items[i].children, targetId)) return true;
          }
        }
        return false;
      };

      if (!deleteItem(data.items, id!)) {
        return res
          .status(404)
          .json({ success: false, error: `${cap(label)} item not found` });
      }
      data.updatedAt = new Date().toISOString();
      await writeTenantData(req, field, data);
      return res
        .status(200)
        .json({
          success: true,
          data,
          message: `${cap(label)} item deleted successfully`,
        });
    } catch {
      return fail(res, "delete");
    }
  });

  return router;
}
