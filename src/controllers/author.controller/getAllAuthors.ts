import prisma from "@/lib/prisma";
import express from "express";
import {
  buildPaginationMeta,
  getPaginationParams,
} from "@/utils/pagination.util";

export const getAllAuthors = async (
  req: express.Request,
  res: express.Response
) => {
  const { page, limit, skip } = getPaginationParams(req);

  const [total, authors] = await Promise.all([
    prisma.author.count(),
    prisma.author.findMany({
      select: {
        username: true,
        id: true,
        name: true,
        image:true,
        email: true,
      },
      skip,
      take: limit,
    }),
  ]);

  if (authors.length < 1)
    return res
      .status(200)
      .json({ data: [], pagination: buildPaginationMeta(total, page, limit) });

  return res.status(200).json({
    data: authors,
    pagination: buildPaginationMeta(total, page, limit),
  });
};
