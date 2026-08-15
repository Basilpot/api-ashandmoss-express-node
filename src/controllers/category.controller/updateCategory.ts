import express from "express";
import prisma from "@/lib/prisma";
import { slugify } from "@/utils/slugify";

export async function updateCategory(
  req: express.Request,
  res: express.Response,
) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Category ID is required" });
  }

  const existing = await prisma.category.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    return res.status(404).json({ message: "Category not found." });
  }

  const { name, slug, image, sortOrder, parentId } = req.body ?? {};

  if (parentId === id) {
    return res.status(400).json({ message: "A category cannot be its own parent" });
  }

  if (slug) {
    const categorySlug = slugify(slug);
    const conflict = await prisma.category.findUnique({
      where: { slug: categorySlug },
      select: { id: true },
    });
    if (conflict && conflict.id !== id) {
      return res.status(409).json({ message: "Category with this slug already exists" });
    }
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

  const data: any = {};
  if (name !== undefined) data.name = name;
  if (slug !== undefined) data.slug = slugify(slug);
  if (image !== undefined) data.image = image ?? null;
  if (sortOrder !== undefined) data.sortOrder = Number(sortOrder);
  if (parentId !== undefined) {
    data.parent = parentId ? { connect: { id: parentId } } : { disconnect: true };
  }

  const category = await prisma.category.update({ where: { id }, data });

  return res.status(200).json({
    message: "Category updated successfully",
    data: { category },
  });
}
