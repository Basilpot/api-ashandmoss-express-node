import messages from "@/constants/messages.constant";
import prisma from "@/lib/prisma";
import express from "express";
import { buildPaginationMeta, getPaginationParams } from "@/utils/pagination.util";

export async function getUserWishlist(
  req: express.Request,
  res: express.Response
) {
  const userId = req.user.id;

  const { page, limit, skip } = getPaginationParams(req);

  const [total, wishlists] = await Promise.all([
    prisma.wishlist.count({ where: { userId } }),
    prisma.wishlist.findMany({
      where: { userId },
      include: {
        item: true,
      },
      skip,
      take: limit,
      orderBy: { id: "asc" },
    }),
  ]);

  if (wishlists.length == 0) {
    return res.status(204).json({
      message: "No items found in your wishlist",
      pagination: buildPaginationMeta(total, page, limit),
    });
  }

  return res.status(200).json({
    message: messages.dataFetched,
    data: wishlists,
    pagination: buildPaginationMeta(total, page, limit),
  });
}
