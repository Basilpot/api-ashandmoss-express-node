import express from "express";
import { listPayments, getPaymentByOrderId, returnFromGateway } from "../controllers/payment.controller";
import { adminMiddleware } from "@/middlewares/admin.middleware";

export const paymentRoute: express.Router = express.Router();

paymentRoute.get("/return", returnFromGateway);

paymentRoute.use(adminMiddleware);

paymentRoute.get("/", listPayments);
paymentRoute.get("/:orderId", getPaymentByOrderId);
