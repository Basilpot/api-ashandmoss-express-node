import express from "express";
import {
  getAllCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/controllers/category.controller";
import { adminMiddleware } from "@/middlewares/admin.middleware";

export const categoryRouter: express.Router = express.Router();

categoryRouter.get("/", getAllCategories);
categoryRouter.get("/:slug", getCategoryBySlug);

categoryRouter.use(adminMiddleware);

categoryRouter.post("/", createCategory);
categoryRouter.patch("/:id", updateCategory);
categoryRouter.delete("/:id", deleteCategory);
