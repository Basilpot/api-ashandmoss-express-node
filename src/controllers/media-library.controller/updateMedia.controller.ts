import express from "express";
import prisma from "@/lib/prisma";
import sharp from "sharp";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";

export async function updateMedia(
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

    const { alt, caption, title, description } = req.body;
    const updateData: Record<string, unknown> = {};

    if (alt !== undefined) updateData.alt = alt;
    if (caption !== undefined) updateData.caption = caption;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;

    // Bake alt text into the image file's EXIF/IPTC metadata
    if (alt !== undefined) {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      const rel = existing.url.replace(/^\/uploads\//, "");
      const filePath = path.join(uploadsDir, rel);
      if (fs.existsSync(filePath)) {
        const ext = path.extname(existing.filename).toLowerCase();
        if (ext !== ".svg" && ext !== ".gif") {
          const altText = alt || "";
          const imgBuffer = await sharp(filePath)
            .withMetadata({
              exif: { IFD0: { ImageDescription: altText } },
              iptc: { "Caption-Abstract": altText },
            } as sharp.WriteableMetadata & { iptc: Record<string, string> })
            .webp({ quality: 85 })
            .toBuffer();
          await fsp.writeFile(filePath, imgBuffer);
        }
      }
    }

    const data = await prisma.media.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({ data });
  } catch (error) {
    console.error("Update media error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
