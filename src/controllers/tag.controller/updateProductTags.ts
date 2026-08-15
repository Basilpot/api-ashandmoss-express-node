import { Request, Response } from "express";
import prisma from "@/lib/prisma";
import { z } from "zod";

const updateProductTagsSchema = z.object({
  productId: z.number().int(),
  tagIds: z.array(z.string()),
});

export async function updateProductTags(req: Request, res: Response) {
  const parsed = updateProductTagsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid request",
      error: parsed.error.issues.map((i) => i.message),
    });
  }

  const { productId, tagIds } = parsed.data;

  const existing = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });

  if (!existing) {
    return res.status(404).json({ message: "Product not found" });
  }

  if (tagIds.length > 0) {
    const tagCount = await prisma.tag.count({ where: { id: { in: tagIds } } });
    if (tagCount !== tagIds.length) {
      return res.status(400).json({ message: "Some tags do not exist" });
    }
  }

  try {
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        tags: {
          set: [],
          ...(tagIds.length > 0 && {
            connect: tagIds.map((tagId) => ({ id: tagId })),
          }),
        },
      },
      select: {
        id: true,
        tags: { select: { id: true, name: true, slug: true } },
      },
    });

    return res.status(200).json({
      message: "Product tags updated successfully",
      data: product,
    });
  } catch {
    return res.status(500).json({
      message: "Failed to update product tags",
    });
  }
}
