import messages from "@/constants/messages.constant";
import prisma from "@/lib/prisma";
import { Request, Response } from "express";
import {
  CreateInfoPageCategoryValidator,
  UpdateInfoPageCategoryValidator,
} from "@/validations/infopage/category.validator";

export async function createInfoPageCategory(req: Request, res: Response) {
  const data = req.body;

  const validatedData = CreateInfoPageCategoryValidator.safeParse(data);
  if (!validatedData.success) {
    return res.status(400).json({
      message: messages.badRequest,
      error: validatedData.error,
    });
  }

  const existing = await prisma.infoPageCategory.findFirst({
    where: {
      categoryHandle: validatedData.data.categoryHandle,
    },
  });
  if (existing) {
    return res.status(409).json({
      message: "A category with this handle already exists",
    });
  }

  const category = await prisma.infoPageCategory.create({
    // @ts-expect-error some type issues
    data: { ...validatedData.data },
  });

  if (!category) {
    return res.status(500).json({ message: messages.serverError });
  }

  return res.status(201).json({
    message: "Category created successfully!",
    category,
  });
}

export async function getAllInfoPageCategories(req: Request, res: Response) {
  const { search, page = "1", limit = "20" } = req.query;

  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
  const skip = (pageNum - 1) * limitNum;

  const where = {
    ...(search
      ? {
          OR: [
            {
              categoryHandle: {
                contains: search as string,
                mode: "insensitive" as const,
              },
            },
            {
              categoryName: {
                contains: search as string,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
  };

  const [categories, total] = await Promise.all([
    prisma.infoPageCategory.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, categoryHandle: true, categoryName: true, createdAt: true,
        _count: { select: { infoPages: true, blogs: true } },
      },
    }),
    prisma.infoPageCategory.count({ where }),
  ]);

  return res.status(200).json({
    categories,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
}

export async function getInfoPageCategoryById(req: Request, res: Response) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      message: "Id is required.",
    });
  }

  const category = await prisma.infoPageCategory.findFirst({
    where: { id },
    include: {
      infoPages: {
        select: {
          id: true,
          title: true,
          slug: true,
          published: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  return res.status(200).json({ category });
}

export async function updateInfoPageCategory(req: Request, res: Response) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      message: "Id is required.",
    });
  }

  const data = req.body;

  const existing = await prisma.infoPageCategory.findFirst({
    where: { id },
  });
  if (!existing) {
    return res.status(404).json({ message: "Category not found" });
  }

  const validatedData = UpdateInfoPageCategoryValidator.safeParse(data);
  if (!validatedData.success) {
    return res.status(400).json({
      message: messages.badRequest,
      error: validatedData.error,
    });
  }

  if (
    validatedData.data.categoryHandle &&
    validatedData.data.categoryHandle !== existing.categoryHandle
  ) {
    const handleTaken = await prisma.infoPageCategory.findFirst({
      where: {
        categoryHandle: validatedData.data.categoryHandle,
      },
    });
    if (handleTaken) {
      return res.status(409).json({
        message: "A category with this handle already exists",
      });
    }
  }

  const updated = await prisma.infoPageCategory.update({
    where: { id },
    // @ts-expect-error some type issues
    data: {
      ...validatedData.data,
      updatedAt: new Date(),
    },
  });

  return res.status(200).json({
    message: "Category updated successfully!",
    category: updated,
  });
}

export async function deleteInfoPageCategory(req: Request, res: Response) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Id is required." });
  }

  const existing = await prisma.infoPageCategory.findFirst({
    where: { id },
    include: { _count: { select: { infoPages: true, blogs: true } } },
  });

  if (!existing) {
    return res.status(404).json({ message: "Category not found" });
  }

  const usage = existing._count.infoPages + existing._count.blogs;
  if (usage > 0) {
    return res.status(409).json({
      message: `Cannot delete category — it has ${existing._count.infoPages} page(s) and ${existing._count.blogs} post(s) assigned. Reassign or delete them first.`,
    });
  }

  await prisma.infoPageCategory.delete({ where: { id } });

  return res.status(200).json({ message: "Category deleted successfully!" });
}
