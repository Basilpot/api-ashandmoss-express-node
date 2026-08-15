import express from "express";
import prisma from "@/lib/prisma";
import { UpdateOrderStatusValidation } from "@/validations/order/order.validation";

const RESTOCKABLE: string[] = ["CANCELLED", "FAILED"];
const NON_TERMINAL: string[] = ["PENDING_PAYMENT", "CONFIRMED"];

export async function updateOrderStatus(
  req: express.Request,
  res: express.Response,
) {
  try {
    const parsed = UpdateOrderStatusValidation.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid status",
        error: parsed.error,
      });
    }
    const { status } = parsed.data;

    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: Number(req.params.id) },
        include: { items: true },
      });

      if (!order) {
        throw new Error("ORDER_NOT_FOUND");
      }

      if (RESTOCKABLE.includes(status) && NON_TERMINAL.includes(order.status)) {
        // ponytail: only variant stock is restored; variant-less products have no stock field
        for (const item of order.items) {
          if (item.variantId) {
            await tx.variant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
      }

      await tx.order.update({
        where: { id: order.id },
        data: { status },
      });
    });

    return res.status(200).json({
      message: "Order status updated successfully",
    });
  } catch (error: any) {
    if (error?.message === "ORDER_NOT_FOUND") {
      return res.status(404).json({ message: "Order not found" });
    }
    return res.status(500).json({
      message: "Failed to update order status",
    });
  }
}
