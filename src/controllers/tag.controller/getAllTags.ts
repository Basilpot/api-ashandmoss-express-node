import express from "express";
import prisma from "@/lib/prisma";

export async function getAllTags(
  req: express.Request,
  res: express.Response,
) {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [tags, total] = await Promise.all([
      prisma.tag.findMany({
        skip,
        take,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          createdAt: true,
          _count: { select: { products: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.tag.count(),
    ]);

    return res.status(200).json({
      message: "Tags retrieved successfully",
      data: {
        tags,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch {
    return res.status(500).json({
      message: "Failed to retrieve tags",
    });
  }
}
