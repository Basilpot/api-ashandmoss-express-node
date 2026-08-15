import express from "express";
import prisma from "@/lib/prisma";
import { OrderStatus } from "@/enums";

export async function completeOrder(
  req: express.Request,
  res: express.Response,
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== OrderStatus.CONFIRMED) {
      return res.status(400).json({
        message: "Only CONFIRMED orders can be completed",
      });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.COMPLETED },
    });

    return res.status(200).json({
      message: "Order completed successfully",
    });
  } catch {
    return res.status(500).json({
      message: "Failed to complete order",
    });
  }
}
