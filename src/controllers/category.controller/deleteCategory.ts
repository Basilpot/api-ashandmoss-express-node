import express from "express";
import prisma from "@/lib/prisma";

export async function deleteCategory(
  req: express.Request,
  res: express.Response,
) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Category ID is required" });
  }

  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: { select: { products: true, children: true } },
    },
  });

  if (!category) {
    return res.status(404).json({ message: "Category not found." });
  }

  if (category._count.products > 0 || category._count.children > 0) {
    return res.status(400).json({
      message:
        "Category has products or child categories and cannot be deleted.",
    });
  }

  await prisma.category.delete({ where: { id } });

  return res.status(200).json({
    message: "Category deleted successfully",
  });
}
