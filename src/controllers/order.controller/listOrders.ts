import express from "express";
import prisma from "@/lib/prisma";
import { getPaginationParams, buildPaginationMeta } from "@/utils/pagination.util";

export async function listOrders(
  req: express.Request,
  res: express.Response,
) {
  try {
    const { page, limit, skip } = getPaginationParams(req);
    const { search, status } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search as string, mode: "insensitive" } },
        { name: { contains: search as string, mode: "insensitive" } },
        { email: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          orderNumber: true,
          name: true,
          email: true,
          phone: true,
          totalAmount: true,
          currency: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          items: {
            select: {
              productName: true,
              variantName: true,
              quantity: true,
              unitPrice: true,
              lineTotal: true,
            },
          },
          payment: {
            select: { status: true, transactionId: true, amount: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where }),
    ]);

    return res.status(200).json({
      message: "Orders retrieved successfully",
      data: { orders, pagination: buildPaginationMeta(total, page, limit) },
    });
  } catch {
    return res.status(500).json({
      message: "Failed to retrieve orders",
    });
  }
}
