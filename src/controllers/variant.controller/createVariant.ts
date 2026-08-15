import express from "express";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

export async function createVariant(
  req: express.Request,
  res: express.Response,
) {
  try {
    const { productId, name, sku, price, compareAtPrice, stock, image, sortOrder } =
      req.body;

    if (!productId || !name || price === undefined) {
      return res.status(400).json({
        message: "productId, name, and price are required",
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: Number(productId) },
      select: { id: true },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const variant = await prisma.variant.create({
      data: {
        productId: Number(productId),
        name,
        sku: sku ?? null,
        price: new Prisma.Decimal(price),
        compareAtPrice: compareAtPrice != null ? new Prisma.Decimal(compareAtPrice) : null,
        stock: Number(stock ?? 0),
        image: image ?? null,
        sortOrder: Number(sortOrder ?? 0),
      },
      include: {
        product: { select: { id: true, title: true } },
      },
    });

    return res.status(201).json({
      message: "Variant created successfully",
      data: { variant },
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to create variant",
      error: error.message,
    });
  }
}
