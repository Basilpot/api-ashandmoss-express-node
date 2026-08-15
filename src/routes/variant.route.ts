import express from "express";
import {
  listVariantsByProduct,
  createVariant,
  updateVariant,
  deleteVariant,
} from "@/controllers/variant.controller";
import { adminMiddleware } from "@/middlewares/admin.middleware";

export const variantRouter: express.Router = express.Router();

variantRouter.use(adminMiddleware);

variantRouter.get("/product/:productId", listVariantsByProduct);
variantRouter.post("/", createVariant);
variantRouter.patch("/:id", updateVariant);
variantRouter.delete("/:id", deleteVariant);
