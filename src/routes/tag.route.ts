import express from "express";
import {
  getAllTags,
  getTagBySlug,
  createTag,
  updateTag,
  deleteTag,
  deleteManyTags,
  updateProductTags,
} from "@/controllers/tag.controller";
import { adminMiddleware } from "@/middlewares/admin.middleware";

export const tagRouter: express.Router = express.Router();

tagRouter.get("/", getAllTags);
tagRouter.get("/:slug", getTagBySlug);

tagRouter.use(adminMiddleware);

tagRouter.post("/", createTag);
tagRouter.patch("/product/:id", updateProductTags);
tagRouter.patch("/:slug", updateTag);
tagRouter.delete("/delete-many", deleteManyTags);
tagRouter.delete("/:id", deleteTag);
