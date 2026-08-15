import express from "express";
import prisma from "@/lib/prisma";
import messages from "@/constants/messages.constant";
import { productListSelect } from "@/controllers/product.controller/productSelect";

export async function getBrandBySlug(
  req: express.Request,
  res: express.Response,
) {
  const { slug } = req.params;

  if (!slug) {
    return res.status(400).json({ message: "Brand slug is required" });
  }

  const brand = await prisma.brand.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true, logo: true, isFeatured: true, sortOrder: true },
  });

  if (!brand) {
    return res.status(404).json({ message: messages.dataNotFound });
  }

  const products = await prisma.product.findMany({
    where: { brandId: brand.id, status: "PUBLISHED" },
    select: productListSelect,
    orderBy: { createdAt: "desc" },
  });

  return res.status(200).json({
    message: messages.dataFetched,
    data: { brand, products },
  });
}
