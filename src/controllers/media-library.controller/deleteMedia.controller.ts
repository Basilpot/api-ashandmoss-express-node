import express from "express";
import prisma from "@/lib/prisma";
import fs from "node:fs";
import path from "node:path";

export async function deleteMedia(
  req: express.Request,
  res: express.Response,
) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Media ID is required" });
    const existing = await prisma.media.findFirst({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Media not found" });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    const rel = existing.url.replace(/^\/uploads\//, "");
    const filePath = path.join(uploadsDir, rel);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.media.delete({ where: { id: id! } });

    return res.status(200).json({ message: "Media deleted" });
  } catch (error) {
    console.error("Delete media error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
