import express from "express";
import {
  createOrder,
  getOrderByNumber,
  listOrders,
  getOrder,
  updateOrderStatus,
  completeOrder,
  deleteOrder,
} from "../controllers/order.controller";
import { adminMiddleware } from "@/middlewares/admin.middleware";

export const orderRoute: express.Router = express.Router();

orderRoute.post("/", createOrder);
orderRoute.get("/by-number/:orderNumber", getOrderByNumber);

orderRoute.use(adminMiddleware);

orderRoute.get("/", listOrders);
orderRoute.get("/:id", getOrder);
orderRoute.patch("/:id/status", updateOrderStatus);
orderRoute.post("/:id/complete", completeOrder);
orderRoute.delete("/:id", deleteOrder);
