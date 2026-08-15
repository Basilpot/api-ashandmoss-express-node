import express from "express";
import {
  getAllBrands,
  getBrandBySlug,
  createBrand,
  updateBrand,
  deleteBrand,
} from "@/controllers/brand.controller";
import { adminMiddleware } from "@/middlewares/admin.middleware";

export const brandRouter: express.Router = express.Router();

brandRouter.get("/", getAllBrands);
brandRouter.get("/:slug", getBrandBySlug);

brandRouter.use(adminMiddleware);

brandRouter.post("/", createBrand);
brandRouter.patch("/:id", updateBrand);
brandRouter.delete("/:id", deleteBrand);
