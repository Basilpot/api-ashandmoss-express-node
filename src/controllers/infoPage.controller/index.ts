import messages from "@/constants/messages.constant";
import prisma from "@/lib/prisma";
import { slugify } from "@/utils/slugify";
import { Request, Response } from "express";
import {
  CreateInfoPageValidator,
  UpdateInfoPageValidator,
} from "@/validations/infopage";
export async function createInfoPage(req: Request, res: Response) {
  const data = req.body;

  const validatedData = CreateInfoPageValidator.safeParse(data);
  if (!validatedData.success) {
    return res.status(400).json({
      message: messages.badRequest,
      error: validatedData.error,
    });
  }

  if (validatedData.data.infoPageCategoryId) {
    const category = await prisma.infoPageCategory.findFirst({
      where: { id: validatedData.data.infoPageCategoryId },
    });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
  }

  const slug = slugify(validatedData.data.slug || validatedData.data.title);

  const slugExists = await prisma.infoPage.findFirst({
    where: { slug },
  });
  if (slugExists) {
    return res.status(409).json({
      message: "A page with this slug already exists",
    });
  }

  const infoPage = await prisma.infoPage.create({
    // @ts-expect-error some type issues
    data: {
      ...validatedData.data,
      slug,
    },
    include: {
      infoPageCategory: true,
    },
  });

  if (!infoPage) {
    return res.status(500).json({ message: messages.serverError });
  }

  return res.status(201).json({
    message: "Info page created successfully!",
    infoPage,
  });
}

export async function getAllInfoPages(req: Request, res: Response) {
  const { search, published, categoryId, page = "1", limit = "20" } = req.query;

  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
  const skip = (pageNum - 1) * limitNum;

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { title: { contains: search as string, mode: "insensitive" } },
      { slug: { contains: search as string, mode: "insensitive" } },
      { content: { contains: search as string, mode: "insensitive" } },
    ];
  }

  if (published !== undefined) {
    where.published = published === "true";
  }

  if (categoryId) {
    where.infoPageCategoryId = categoryId as string;
  }

  const [infoPages, total] = await Promise.all([
    prisma.infoPage.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true, title: true, slug: true, coverImage: true,
        metaTitle: true, metaDescription: true, published: true,
        createdAt: true, updatedAt: true, infoPageCategoryId: true,
        infoPageCategory: {
          select: { id: true, categoryHandle: true, categoryName: true },
        },
      },
    }),
    prisma.infoPage.count({ where }),
  ]);

  return res.status(200).json({
    infoPages,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
}

export async function getInfoPageById(req: Request, res: Response) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      message: "Id is required.",
    });
  }

  const infoPage = await prisma.infoPage.findFirst({
    where: { id },
    include: {
      infoPageCategory: true,
    },
  });

  if (!infoPage) {
    return res.status(404).json({ message: "Info page not found" });
  }

  return res.status(200).json({ infoPage });
}

export async function getInfoPageBySlug(req: Request, res: Response) {
  const { slug } = req.params;

  if (!slug) {
    return res.status(400).json({
      message: "Slug is required.",
    });
  }

  const infoPage = await prisma.infoPage.findFirst({
    where: { slug },
    include: {
      infoPageCategory: true,
    },
  });

  if (!infoPage) {
    return res.status(404).json({ message: "Info page not found" });
  }

  return res.status(200).json({ infoPage });
}

export async function updateInfoPage(req: Request, res: Response) {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "Id is required." });
  }
  const data = req.body;

  const existing = await prisma.infoPage.findFirst({
    where: { id },
  });
  if (!existing) {
    return res.status(404).json({ message: "Info page not found" });
  }

  const validatedData = UpdateInfoPageValidator.safeParse(data);
  if (!validatedData.success) {
    return res.status(400).json({
      message: messages.badRequest,
      error: validatedData.error,
    });
  }

  if (validatedData.data.infoPageCategoryId) {
    const category = await prisma.infoPageCategory.findFirst({
      where: { id: validatedData.data.infoPageCategoryId },
    });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
  }

  let slug = existing.slug;
  if (validatedData.data.slug && validatedData.data.slug !== existing.slug) {
    slug = slugify(validatedData.data.slug);
    const slugExists = await prisma.infoPage.findFirst({
      where: { slug },
    });
    if (slugExists) {
      return res.status(409).json({
        message: "A page with this slug already exists",
      });
    }
  }

  const updated = await prisma.infoPage.update({
    where: { id },
    // @ts-expect-error some type issues
    data: {
      ...validatedData.data,
      slug,
      updatedAt: new Date(),
    },
    include: {
      infoPageCategory: true,
    },
  });

  return res.status(200).json({
    message: "Info page updated successfully!",
    infoPage: updated,
  });
}

export async function deleteInfoPage(req: Request, res: Response) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Id is required." });
  }

  const existing = await prisma.infoPage.findFirst({
    where: { id },
  });
  if (!existing) {
    return res.status(404).json({ message: "Info page not found" });
  }

  await prisma.infoPage.delete({ where: { id } });

  return res.status(200).json({ message: "Info page deleted successfully!" });
}
