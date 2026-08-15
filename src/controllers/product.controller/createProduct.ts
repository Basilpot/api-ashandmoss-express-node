import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import prisma from "@/lib/prisma";
import { createProductSchema } from "@/validations/product/productValidator";
import messages from "@/constants/messages.constant";
import { slugify } from "@/utils/slugify";
import { formatZodError } from "@/utils/zodError.util";
import { productDetailSelect } from "./productSelect";
import { variantCreate } from "./variantPayload";

export async function createProduct(req: Request, res: Response) {
  const parsed = createProductSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: messages.badRequest,
      errors: formatZodError(parsed.error),
    });
  }

  const { slug, categoryId, brandId, tagIds, variants, ...others } =
    parsed.data;

  if (categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });
    if (!category) {
      return res.status(400).json({ message: "Invalid category reference." });
    }
  }

  if (brandId) {
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
      select: { id: true },
    });
    if (!brand) {
      return res.status(400).json({ message: "Invalid brand reference." });
    }
  }

  if (tagIds && tagIds.length > 0) {
    const tagCount = await prisma.tag.count({ where: { id: { in: tagIds } } });
    if (tagCount !== tagIds.length) {
      return res.status(400).json({ message: "Invalid tag reference." });
    }
  }

  const nextSlug = slugify(slug || others.title);
  const variantPrices = (variants ?? []).map((v) => v.price);

  const payload: any = { ...others };
  payload.slug = nextSlug;
  payload.price = others.price ?? (variantPrices.length ? Math.min(...variantPrices) : null);
  payload.maxPrice =
    others.maxPrice ?? (variantPrices.length ? Math.max(...variantPrices) : null);

  if (categoryId) payload.category = { connect: { id: categoryId } };
  if (brandId) payload.brand = { connect: { id: brandId } };
  if (tagIds && tagIds.length > 0) {
    payload.tags = { connect: tagIds.map((id) => ({ id })) };
  }
  if (variants && variants.length > 0) {
    payload.variants = { create: variants.map(variantCreate) };
  }

  try {
    const product = await prisma.$transaction((tx) =>
      tx.product.create({ data: payload, select: productDetailSelect }),
    );

    return res.status(201).json({
      message: messages.created,
      data: product,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return res.status(409).json({
          message: "A product with this slug already exists.",
          errors: [{ field: "slug", message: "This slug is already in use." }],
        });
      }
      return res.status(400).json({ message: messages.failedToCreate });
    }
    if (error instanceof Prisma.PrismaClientValidationError) {
      return res.status(400).json({ message: messages.invalidBody });
    }
    return res.status(500).json({ message: messages.failedToCreate });
  }
}
