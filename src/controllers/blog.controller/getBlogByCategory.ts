import express from "express";
import prisma from "@/lib/prisma";
import messages from "@/constants/messages.constant";
import {
  buildPaginationMeta,
  getPaginationParams,
} from "@/utils/pagination.util";

export const getBlogByCategory = async (
  req: express.Request,
  res: express.Response,
) => {
  const categoryHandle = req.params.category;
  const trash = req.params.trash;

  const { page, limit, skip } = getPaginationParams(req);

  if (!categoryHandle) {
    return res.status(400).json({
      message: "category handle is required.",
    });
  }

  const category = await prisma.infoPageCategory.findFirst({
    where: { categoryHandle },
  });

  if (!category) {
    return res.status(404).json({
      message: "Category not found!",
    });
  }

  const blogWhere: any = { blogCategoryId: category.id, inTrash: trash ? true : false };

  const [total, blogs] = await Promise.all([
    prisma.blog.count({ where: blogWhere }),
    prisma.blog.findMany({
      where: blogWhere,
      skip,
      take: limit,
      include: {
        category: true,
        writer: true,
      },
    }),
  ]);

  if (blogs.length < 1) {
    return res.status(200).json({
      message: "No blogs found!",
    });
  }

  return res.status(200).json({
    message: messages.dataFetched,
    data: blogs,
    paginaation: buildPaginationMeta(total, page, limit),
  });
};
