import express from "express";
import prisma from "@/lib/prisma";
import messages from "@/constants/messages.constant";
import { productListSelect } from "@/controllers/product.controller/productSelect";

export async function getCategoryBySlug(
  req: express.Request,
  res: express.Response,
) {
  const { slug } = req.params;

  if (!slug) {
    return res.status(400).json({ message: "Category slug is required" });
  }

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      children: {
        select: { id: true, name: true, slug: true, image: true, sortOrder: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!category) {
    return res.status(404).json({ message: messages.dataNotFound });
  }

  const products = await prisma.product.findMany({
    where: { categoryId: category.id, status: "PUBLISHED" },
    select: productListSelect,
    orderBy: { createdAt: "desc" },
  });

  return res.status(200).json({
    message: messages.dataFetched,
    data: { category, products },
  });
}
