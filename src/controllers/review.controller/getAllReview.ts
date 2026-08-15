import { Request, Response } from "express";
import prisma from "@lib/prisma";
import messages from "@/constants/messages.constant";
import { buildPaginationMeta, getPaginationParams } from "@/utils/pagination.util";

export async function getAllReviews(req: Request, res: Response) {
  const { page, limit, skip } = getPaginationParams(req);

  const where = {};

  const [total, reviews] = await Promise.all([
    prisma.review.count({ where }),
    prisma.review.findMany({
      where,
      skip,
      take: limit,
      orderBy: { id: "asc" },
    }),
  ]);

  return res.status(200).json({
    message: messages.dataFetched, 
    reviews: reviews,
    pagination: buildPaginationMeta(total, page, limit),
  });
}
