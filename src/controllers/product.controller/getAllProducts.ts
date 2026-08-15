import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import prisma from "@/lib/prisma";
import {
  buildPaginationMeta,
  getPaginationParams,
} from "@/utils/pagination.util";
import { productListSelect } from "./productSelect";

export const getAllProducts = async (req: Request, res: Response) => {
  const { page, limit, skip } = getPaginationParams(req);
  const { category, brand, tag, search, isFeatured, status } = req.query;

  const order: "asc" | "desc" = req.query.order === "asc" ? "asc" : "desc";
  const sort =
    typeof req.query.sort === "string" && req.query.sort.length > 0
      ? req.query.sort
      : "newest";

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  if (sort === "oldest") orderBy = { createdAt: "asc" };
  else if (sort === "price-asc") orderBy = { price: "asc" };
  else if (sort === "price-desc") orderBy = { price: "desc" };
  else if (sort === "slug") orderBy = { slug: order };

  // ponytail: `any` so price min/max merges don't fight the FloatFilter | number union
  const where: any = {};

  const isAuthed = Boolean((req as any).user);
  if (status === "published") where.status = "PUBLISHED";
  else if (status === "draft") where.status = "DRAFT";
  else if (status !== "all" && !isAuthed) where.status = "PUBLISHED";

  try {
    if (category && typeof category === "string") {
      const found = await prisma.category.findUnique({
        where: { slug: category },
        select: { id: true },
      });
      if (!found) return res.status(404).json({ message: "Category not found" });
      where.categoryId = found.id;
    }

    if (brand && typeof brand === "string") {
      const found = await prisma.brand.findUnique({
        where: { slug: brand },
        select: { id: true },
      });
      if (!found) return res.status(404).json({ message: "Brand not found" });
      where.brandId = found.id;
    }

    if (tag && typeof tag === "string") {
      const found = await prisma.tag.findUnique({
        where: { slug: tag },
        select: { id: true },
      });
      if (!found) return res.status(404).json({ message: "Tag not found" });
      where.tags = { some: { id: found.id } };
    }
  } catch (err) {
    console.error("Error resolving filters:", err);
    return res.status(500).json({ message: "Server error" });
  }

  if (isFeatured === "true") where.isFeatured = true;

  const minPriceRaw = req.query.minPrice;
  const maxPriceRaw = req.query.maxPrice;
  const minPrice =
    minPriceRaw !== undefined ? Number(minPriceRaw) : undefined;
  const maxPrice =
    maxPriceRaw !== undefined ? Number(maxPriceRaw) : undefined;

  if (typeof minPrice === "number" && !Number.isNaN(minPrice))
    where.price = { ...(where.price || {}), gte: minPrice };
  if (typeof maxPrice === "number" && !Number.isNaN(maxPrice))
    where.price = { ...(where.price || {}), lte: maxPrice };

  if (search && typeof search === "string" && search.trim().length > 0) {
    where.title = { contains: search.trim(), mode: "insensitive" };
  }

  const attributeConditions: Prisma.ProductWhereInput[] = [];

  const attributeParam = req.query.attribute;
  const attributeParams =
    attributeParam !== undefined
      ? Array.isArray(attributeParam)
        ? attributeParam
        : [attributeParam]
      : [];
  for (const raw of attributeParams) {
    if (typeof raw !== "string") continue;
    const colon = raw.indexOf(":");
    if (colon === -1) continue;
    const name = raw.slice(0, colon).trim();
    const value = raw.slice(colon + 1).trim();
    if (!name) continue;
    attributeConditions.push({
      attributes: { array_contains: [{ name, value }] },
    });
  }

  const attributesParam = req.query.attributes;
  if (
    attributesParam &&
    typeof attributesParam === "object" &&
    !Array.isArray(attributesParam)
  ) {
    for (const [name, value] of Object.entries(attributesParam)) {
      if (typeof value === "string") {
        attributeConditions.push({
          attributes: { array_contains: [{ name, value }] },
        });
      }
    }
  }

  if (attributeConditions.length > 0) where.AND = attributeConditions;

  try {
    const total = await prisma.product.count({ where });
    const products = await prisma.product.findMany({
      where,
      take: limit,
      skip,
      orderBy,
      select: productListSelect,
    });

    return res.status(200).json({
      products,
      pagination: buildPaginationMeta(total, page, limit),
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
