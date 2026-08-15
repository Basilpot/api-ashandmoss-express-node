import express from "express";
import prisma from "@/lib/prisma";

export async function deleteManyTags(
  req: express.Request,
  res: express.Response,
) {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        message: "Array of tag IDs is required",
      });
    }

    const result = await prisma.tag.deleteMany({
      where: { id: { in: ids } },
    });

    return res.status(200).json({
      message: `${result.count} tag(s) deleted successfully`,
      data: { deletedCount: result.count },
    });
  } catch {
    return res.status(500).json({
      message: "Failed to delete tags",
    });
  }
}
