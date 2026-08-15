import express from "express";
import prisma from "@/lib/prisma";
import { productListSelect } from "@/controllers/product.controller/productSelect";

export async function getTagBySlug(
  req: express.Request,
  res: express.Response,
) {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({ message: "Tag slug is required" });
    }

    const tag = await prisma.tag.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        products: {
          where: { status: "PUBLISHED" },
          select: productListSelect,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    return res.status(200).json({
      message: "Tag retrieved successfully",
      data: { tag },
    });
  } catch {
    return res.status(500).json({
      message: "Failed to retrieve tag",
    });
  }
}
