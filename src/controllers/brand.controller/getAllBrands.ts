import express from "express";
import prisma from "@/lib/prisma";

export async function getAllBrands(
  req: express.Request,
  res: express.Response,
) {
  const featured = req.query.featured === "true";

  const brands = await prisma.brand.findMany({
    where: featured ? { isFeatured: true } : {},
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      isFeatured: true,
      sortOrder: true,
      _count: { select: { products: true } },
    },
    orderBy: { sortOrder: "asc" },
  });

  return res.status(200).json({ brands });
}
