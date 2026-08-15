import express from "express";
import prisma from "@/lib/prisma";

export async function deleteOrder(
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

    await prisma.order.delete({ where: { id: order.id } });

    return res.status(200).json({
      message: "Order deleted successfully",
    });
  } catch {
    return res.status(500).json({
      message: "Failed to delete order",
    });
  }
}
