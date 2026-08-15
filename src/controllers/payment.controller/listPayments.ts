import express from "express";
import prisma from "@/lib/prisma";
import { getPaginationParams, buildPaginationMeta } from "@/utils/pagination.util";

export async function listPayments(
  req: express.Request,
  res: express.Response,
) {
  try {
    const { page, limit, skip } = getPaginationParams(req);
    const { status, search } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.order = {
        OR: [
          { orderNumber: { contains: search as string, mode: "insensitive" } },
          { name: { contains: search as string, mode: "insensitive" } },
          { email: { contains: search as string, mode: "insensitive" } },
        ],
      };
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          orderId: true,
          amount: true,
          currency: true,
          status: true,
          transactionId: true,
          provider: true,
          createdAt: true,
          order: {
            select: { orderNumber: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.payment.count({ where }),
    ]);

    return res.status(200).json({
      message: "Payments retrieved successfully",
      data: { payments, pagination: buildPaginationMeta(total, page, limit) },
    });
  } catch {
    return res.status(500).json({
      message: "Failed to retrieve payments",
    });
  }
}
