import express from "express";
import prisma from "@/lib/prisma";
import { slugify } from "@/utils/slugify";

export async function createCategory(
  req: express.Request,
  res: express.Response,
) {
  const { name, slug, image, sortOrder, parentId } = req.body ?? {};

  if (!name || !slug) {
    return res.status(400).json({ message: "Category name and slug are required" });
  }

  const categorySlug = slugify(slug);

  const existing = await prisma.category.findUnique({
    where: { slug: categorySlug },
    select: { id: true },
  });
  if (existing) {
    return res.status(409).json({ message: "Category with this slug already exists" });
  }

  if (parentId) {
    const parent = await prisma.category.findUnique({
      where: { id: parentId },
      select: { id: true },
    });
    if (!parent) {
      return res.status(400).json({ message: "Invalid parent category reference." });
    }
  }

  const category = await prisma.category.create({
    data: {
      name,
      slug: categorySlug,
      image: image ?? null,
      sortOrder: Number(sortOrder ?? 0),
      ...(parentId && { parent: { connect: { id: parentId } } }),
    },
  });

  return res.status(201).json({
    message: "Category created successfully",
    data: { category },
  });
}
