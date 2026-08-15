import express from "express";
import {
  getAllProducts,
  getPublishedProduct,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/controllers/product.controller";
import { adminMiddleware } from "@/middlewares/admin.middleware";

export const productRouter: express.Router = express.Router();

productRouter.get("/", getAllProducts);

productRouter.get("/featured", (req, res) => {
  req.query.isFeatured = "true";
  return getAllProducts(req, res);
});

productRouter.get("/:slug", getPublishedProduct);

productRouter.use(adminMiddleware);

productRouter.get("/by-id/:id", getProductById);
productRouter.get("/by-slug/:slug", getProductBySlug);
productRouter.post("/", createProduct);
productRouter.patch("/:id", updateProduct);
productRouter.delete("/:id", deleteProduct);
