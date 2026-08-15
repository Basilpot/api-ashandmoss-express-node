import express from "express";
import prisma from "@/lib/prisma";

export async function batchMedia(
  req: express.Request,
  res: express.Response,
) {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "ids array is required" });
    }

    if (ids.length > 200) {
      return res.status(400).json({ error: "max 200 ids per request" });
    }

    const items = await prisma.media.findMany({
      where: { id: { in: ids } },
    });

    const map: Record<string, (typeof items)[number]> = {};
    for (const item of items) {
      map[item.id] = item;
    }

    return res.status(200).json({ data: map });
  } catch (error) {
    console.error("Batch media error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
