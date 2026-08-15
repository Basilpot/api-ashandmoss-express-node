import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import prisma from "@/lib/prisma";
import { updateProductSchema } from "@/validations/product/productValidator";
import messages from "@/constants/messages.constant";
import { slugify } from "@/utils/slugify";
import { formatZodError } from "@/utils/zodError.util";
import { productDetailSelect } from "./productSelect";
import { variantCreate } from "./variantPayload";

export async function updateProduct(req: Request, res: Response) {
  const { id } = req.params;

  const parsed = updateProductSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: messages.badRequest,
      errors: formatZodError(parsed.error),
    });
  }

  const existing = await prisma.product.findUnique({
    where: { id: Number(id) },
    select: { id: true, slug: true },
  });

  if (!existing) {
    return res.status(404).json({ message: "Product not found" });
  }

  const { slug, categoryId, brandId, tagIds, variants, ...others } =
    parsed.data;

  if (categoryId !== undefined && categoryId !== null) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });
    if (!category) {
      return res.status(400).json({ message: "Invalid category reference." });
    }
  }

  if (brandId !== undefined && brandId !== null) {
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

  // ponytail: only fields actually present in the body are applied. The update
  // schema reuses create defaults (tagIds/variants/images default to []), which
  // would otherwise clobber existing data on every partial update.
  const rawBody: Record<string, unknown> = req.body ?? {};
  const payload: any = {};
  for (const key of Object.keys(rawBody)) {
    if (key in others) payload[key] = others[key as keyof typeof others];
  }

  if ("slug" in rawBody && slug) payload.slug = slugify(slug);

  if ("categoryId" in rawBody) {
    payload.category = categoryId
      ? { connect: { id: categoryId } }
      : { disconnect: true };
  }
  if ("brandId" in rawBody) {
    payload.brand = brandId
      ? { connect: { id: brandId } }
      : { disconnect: true };
  }
  if ("tagIds" in rawBody) {
    const ids = tagIds ?? [];
    payload.tags = { set: ids.map((tagId) => ({ id: tagId })) };
  }
  if ("variants" in rawBody) {
    const variantList = variants ?? [];
    if (others.price === undefined) {
      payload.price = variantList.length
        ? Math.min(...variantList.map((v) => v.price))
        : null;
    }
    if (others.maxPrice === undefined) {
      payload.maxPrice = variantList.length
        ? Math.max(...variantList.map((v) => v.price))
        : null;
    }
    payload.variants = {
      deleteMany: {},
      ...(variantList.length > 0 && { create: variantList.map(variantCreate) }),
    };
  }

  try {
    const product = await prisma.$transaction((tx) =>
      tx.product.update({
        where: { id: Number(id) },
        data: payload,
        select: productDetailSelect,
      }),
    );

    return res.status(200).json({
      message: "Product updated successfully",
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
      return res.status(400).json({ message: messages.failedToUpdate });
    }
    if (error instanceof Prisma.PrismaClientValidationError) {
      return res.status(400).json({ message: messages.invalidBody });
    }
    return res.status(500).json({ message: messages.failedToUpdate });
  }
}
