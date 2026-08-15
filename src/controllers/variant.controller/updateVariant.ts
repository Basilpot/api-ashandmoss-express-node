import express from "express";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

export async function updateVariant(
  req: express.Request,
  res: express.Response,
) {
  try {
    const { id } = req.params;
    const { name, sku, price, compareAtPrice, stock, image, sortOrder } =
      req.body;

    if (!id) {
      return res.status(400).json({ message: "Variant ID is required" });
    }

    const existing = await prisma.variant.findUnique({
      where: { id: Number(id) },
      select: { id: true },
    });
    if (!existing) {
      return res.status(404).json({ message: "Variant not found" });
    }

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (sku !== undefined) data.sku = sku ?? null;
    if (price !== undefined) data.price = new Prisma.Decimal(price);
    if (compareAtPrice !== undefined) {
      data.compareAtPrice =
        compareAtPrice != null ? new Prisma.Decimal(compareAtPrice) : null;
    }
    if (stock !== undefined) data.stock = Number(stock);
    if (image !== undefined) data.image = image ?? null;
    if (sortOrder !== undefined) data.sortOrder = Number(sortOrder);

    const variant = await prisma.variant.update({
      where: { id: Number(id) },
      data,
      include: {
        product: { select: { id: true, title: true } },
      },
    });

    return res.status(200).json({
      message: "Variant updated successfully",
      data: { variant },
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to update variant",
      error: error.message,
    });
  }
}
