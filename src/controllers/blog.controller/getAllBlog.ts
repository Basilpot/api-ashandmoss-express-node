import prisma from "@/lib/prisma";
import express from "express";
import {
  buildPaginationMeta,
  getPaginationParams,
} from "@/utils/pagination.util";

export async function getAllBlogs(req: express.Request, res: express.Response) {
  try {
    const { trash, search, category } = req.query;
    const { page, limit, skip } = getPaginationParams(req);
    let categoryId = null;

    if (category) {
      const foundCategory = await prisma.infoPageCategory.findFirst({
        where: { categoryHandle: String(category) },
      });
      categoryId = foundCategory?.id || null;
    }

    // const inTrash = status === "trash";

    const where: any = { inTrash: trash === "true" };

    // Only apply category filter if we resolved a categoryId
    if (category && categoryId) {
      where.blogCategoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { title: { contains: String(search), mode: "insensitive" } },
        { content: { contains: String(search), mode: "insensitive" } },
        {
          writer: {
            is: {
              username: {
                contains: String(search),
                mode: "insensitive",
              },
            },
          },
        },
      ];
    }

    const [total, blogs] = await Promise.all([
      prisma.blog.count({ where }),
      prisma.blog.findMany({
        where,
        select: {
          id: true, title: true, slug: true, coverImage: true,
          published: true, publishedAt: true, createdAt: true, updatedAt: true,
          metaDescription: true, metaTitle: true, inTrash: true,
          writer: {
            select: { username: true, name: true },
          },
          category: {
            select: { categoryName: true, categoryHandle: true },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
    ]);

    return res.status(200).json({
      message: "Blogs fetched successfully",
      data: blogs,
      pagination: buildPaginationMeta(total, page, limit),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error", error });
  }
}
