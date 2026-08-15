import express from "express";
import prisma from "@/lib/prisma";

export async function listVariantsByProduct(
  req: express.Request,
  res: express.Response,
) {
  const productId = Number(req.params.productId);

  if (!Number.isInteger(productId)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  const variants = await prisma.variant.findMany({
    where: { productId },
    orderBy: { sortOrder: "asc" },
  });

  return res.status(200).json({
    message: "Variants retrieved successfully",
    data: { variants },
  });
}
