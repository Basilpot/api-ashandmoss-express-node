import express from "express";
import prisma from "@/lib/prisma";
import { slugify } from "@/utils/slugify";

export async function updateBrand(req: express.Request, res: express.Response) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(404).json({ message: "Brand not found." });
  }

  const existing = await prisma.brand.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) {
    return res.status(404).json({ message: "Brand not found." });
  }

  const { name, slug, logo, isFeatured, sortOrder } = req.body ?? {};

  if (slug) {
    const brandSlug = slugify(slug);
    const conflict = await prisma.brand.findUnique({
      where: { slug: brandSlug },
      select: { id: true },
    });
    if (conflict && conflict.id !== id) {
      return res.status(409).json({ message: "Brand with this slug already exists" });
    }
  }

  const data: any = {};
  if (name !== undefined) data.name = name;
  if (slug !== undefined) data.slug = slugify(slug);
  if (logo !== undefined) data.logo = logo ?? null;
  if (isFeatured !== undefined) data.isFeatured = Boolean(isFeatured);
  if (sortOrder !== undefined) data.sortOrder = Number(sortOrder);

  const brand = await prisma.brand.update({ where: { id }, data });

  return res.status(200).json({
    message: "Brand updated successfully",
    data: { brand },
  });
}
