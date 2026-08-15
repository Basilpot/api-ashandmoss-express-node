import express from "express";
import prisma from "@/lib/prisma";
import { adminMiddleware } from "@/middlewares/admin.middleware";

export const siteConfigRouter: express.Router = express.Router();

const getConfig = async () => {
  const setting = await prisma.storeSetting.findFirst();
  return (setting?.siteConfig as any) ?? null;
};

const setConfig = async (siteConfig: unknown) => {
  await prisma.storeSetting.upsert({
    where: { id: 1 },
    update: { siteConfig: siteConfig as any },
    create: { id: 1, siteConfig: siteConfig as any },
  });
};

/**
 * @openapi
 * /api/v1/site-config:
 *   get:
 *     tags:
 *       - Site Config
 *     summary: Get site configuration
 *     responses:
 *       200:
 *         description: site configuration
 */
siteConfigRouter.get("/", async (req: express.Request, res: express.Response) => {
  try {
    const data = await getConfig();
    return res.status(200).json({ success: true, data });
  } catch {
    return res.status(500).json({ success: false, error: "Failed to read siteConfig" });
  }
});

/**
 * @openapi
 * /api/v1/site-config:
 *   post:
 *     tags:
 *       - Site Config
 *     summary: Replace entire site configuration
 *     responses:
 *       200:
 *         description: config saved
 */
siteConfigRouter.post("/", adminMiddleware, async (req: express.Request, res: express.Response) => {
  try {
    const config = req.body;
    if (!config || typeof config !== "object") {
      return res.status(400).json({ success: false, error: "Invalid config data" });
    }
    await setConfig(config);
    return res.status(200).json({ success: true, data: config, message: "Site config saved" });
  } catch {
    return res.status(500).json({ success: false, error: "Failed to save siteConfig" });
  }
});

/**
 * @openapi
 * /api/v1/site-config:
 *   put:
 *     tags:
 *       - Site Config
 *     summary: Merge updates into site configuration
 *     responses:
 *       200:
 *         description: config updated
 */
siteConfigRouter.put("/", adminMiddleware, async (req: express.Request, res: express.Response) => {
  try {
    const updates = req.body;
    if (!updates || typeof updates !== "object") {
      return res.status(400).json({ success: false, error: "Invalid update data" });
    }
    const existing = await getConfig();
    const merged = { ...(existing ?? {}), ...updates };
    await setConfig(merged);
    return res.status(200).json({ success: true, data: merged, message: "Site config updated" });
  } catch {
    return res.status(500).json({ success: false, error: "Failed to update siteConfig" });
  }
});
