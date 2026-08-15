import express from "express";
import prisma from "@/lib/prisma";

export async function deleteVariant(
  req: express.Request,
  res: express.Response,
) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Variant ID is required" });
    }

    const variant = await prisma.variant.findUnique({
      where: { id: Number(id) },
      select: { id: true },
    });

    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }

    // ponytail: OrderItem.variant has no cascade; block deletion over a 500 FK crash
    const orderCount = await prisma.orderItem.count({
      where: { variantId: Number(id) },
    });
    if (orderCount > 0) {
      return res.status(409).json({
        message: `Cannot delete variant: ${orderCount} order item(s) reference it`,
      });
    }

    await prisma.variant.delete({ where: { id: Number(id) } });

    return res.status(200).json({ message: "Variant deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to delete variant",
      error: error.message,
    });
  }
}
