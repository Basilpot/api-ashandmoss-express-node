import express from "express";
import prisma from "@/lib/prisma";
import { slugify } from "@/utils/slugify";

export async function createBrand(req: express.Request, res: express.Response) {
  const { name, slug, logo, isFeatured, sortOrder } = req.body ?? {};

  if (!name || !slug) {
    return res.status(400).json({ message: "Brand name and slug are required" });
  }

  const brandSlug = slugify(slug);

  const existing = await prisma.brand.findUnique({
    where: { slug: brandSlug },
    select: { id: true },
  });
  if (existing) {
    return res.status(409).json({ message: "Brand with this slug already exists" });
  }

  const brand = await prisma.brand.create({
    data: {
      name,
      slug: brandSlug,
      logo: logo ?? null,
      isFeatured: Boolean(isFeatured ?? false),
      sortOrder: Number(sortOrder ?? 0),
    },
  });

  return res.status(201).json({
    message: "Brand created successfully",
    data: { brand },
  });
}
