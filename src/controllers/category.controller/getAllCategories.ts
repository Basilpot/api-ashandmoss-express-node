import express from "express";
import prisma from "@/lib/prisma";

export async function getAllCategories(
  req: express.Request,
  res: express.Response,
) {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
      sortOrder: true,
      parentId: true,
      _count: { select: { products: true } },
    },
    orderBy: { sortOrder: "asc" },
  });

  const byId = new Map<string, any>();
  const roots: any[] = [];

  for (const c of categories) {
    const node: any = { ...c, children: [] };
    byId.set(c.id, node);
    const parent = c.parentId ? byId.get(c.parentId) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }

  return res.status(200).json({ categories: roots });
}
