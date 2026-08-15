import messages from "@/constants/messages.constant";
import prisma from "@/lib/prisma";
import express from "express";

export async function getDashboardStats(
  req: express.Request,
  res: express.Response,
) {
  const [products, orders, revenue] = await Promise.all([
    prisma.product.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.payment.aggregate({
      where: { status: "SUCCESS" },
      _sum: { amount: true },
    }),
  ]);

  const countBy = <T extends string>(
    rows: { status: T; _count: { _all: number } }[],
  ) =>
    Object.fromEntries(rows.map((r) => [r.status, r._count._all])) as Record<
      T,
      number
    >;

  const productCounts = countBy(products);
  const orderCounts = countBy(orders);

  return res.status(200).json({
    message: messages.dataFetched,
    data: {
      totalProducts: Object.values(productCounts).reduce((a, b) => a + b, 0),
      publishedProducts: productCounts.PUBLISHED ?? 0,
      draftProducts: productCounts.DRAFT ?? 0,
      totalOrders: Object.values(orderCounts).reduce((a, b) => a + b, 0),
      pendingOrders: orderCounts.PENDING_PAYMENT ?? 0,
      confirmedOrders: orderCounts.CONFIRMED ?? 0,
      completedOrders: orderCounts.COMPLETED ?? 0,
      failedOrders: orderCounts.FAILED ?? 0,
      cancelledOrders: orderCounts.CANCELLED ?? 0,
      totalRevenue: revenue._sum.amount ?? 0,
    },
  });
}
