import express from "express";
import prisma from "@/lib/prisma";

export async function deleteBrand(req: express.Request, res: express.Response) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(404).json({ message: "Brand not found." });
  }

  const existing = await prisma.brand.findUnique({
    where: { id },
    select: { id: true, _count: { select: { products: true } } },
  });
  if (!existing) {
    return res.status(404).json({ message: "Brand not found." });
  }

  if (existing._count.products > 0) {
    return res.status(400).json({
      message: "Brand has products and cannot be deleted.",
    });
  }

  await prisma.brand.delete({ where: { id } });

  return res.status(200).json({
    message: "Brand deleted successfully",
  });
}
