import express from "express";
import prisma from "@/lib/prisma";

export async function getPaymentByOrderId(
  req: express.Request,
  res: express.Response,
) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { orderId: Number(req.params.orderId) },
      select: {
        id: true,
        orderId: true,
        amount: true,
        currency: true,
        status: true,
        transactionId: true,
        provider: true,
        createdAt: true,
        order: {
          select: { orderNumber: true, name: true, email: true },
        },
      },
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    return res.status(200).json({
      message: "Payment retrieved successfully",
      data: { payment },
    });
  } catch {
    return res.status(500).json({
      message: "Failed to retrieve payment",
    });
  }
}
