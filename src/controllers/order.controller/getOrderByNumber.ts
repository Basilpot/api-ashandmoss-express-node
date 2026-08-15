import express from "express";
import prisma from "@/lib/prisma";

export async function getOrderByNumber(
  req: express.Request,
  res: express.Response,
) {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber: String(req.params.orderNumber) },
      select: {
        orderNumber: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        note: true,
        totalAmount: true,
        currency: true,
        status: true,
        createdAt: true,
        items: {
          select: {
            productName: true,
            variantName: true,
            quantity: true,
            unitPrice: true,
            lineTotal: true,
          },
        },
        payment: {
          select: { status: true, transactionId: true, amount: true },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({
      message: "Order retrieved successfully",
      data: { order },
    });
  } catch {
    return res.status(500).json({
      message: "Failed to retrieve order",
    });
  }
}
