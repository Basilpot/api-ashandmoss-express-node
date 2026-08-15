import express from "express";
import prisma from "@/lib/prisma";
import { saveLocalFile } from "@/images/local-upload";
import sharp from "sharp";
import { convertToWebP } from "@/lib/sharp";

export async function uploadMedia(
  req: express.Request,
  res: express.Response,
) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.file as Express.Multer.File;

    // Convert raster images to WebP server-side
    if (file.mimetype && file.mimetype !== "image/svg+xml" && file.mimetype !== "image/gif") {
      try {
        const webpBuffer = await convertToWebP(file.buffer);
        file.originalname = file.originalname.replace(/\.[^.]+$/, ".webp");
        file.buffer = webpBuffer;
        file.size = webpBuffer.length;
      } catch {
        // conversion failed — save original buffer as-is
      }
    }

    const result = await saveLocalFile(file, "media");

    if (!result.success || !result.url || !result.filename) {
      return res.status(500).json({ error: "Failed to save file", details: result.error });
    }

    let width: number | null = null;
    let height: number | null = null;
    try {
      const metadata = await sharp(file.buffer).metadata();
      width = metadata.width || null;
      height = metadata.height || null;
    } catch {
      // dimensions extraction failed
    }

    const ext = result.filename.split(".").pop()?.toLowerCase() || "";
    const EXT_TO_MIME: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      svg: "image/svg+xml",
      avif: "image/avif",
    };

    const media = await prisma.media.create({
      data: {
        url: result.url,
        filename: result.filename,
        mimeType: EXT_TO_MIME[ext] || file.mimetype || null,
        fileSize: file.size,
        width,
        height,
      },
    });

    return res.status(201).json({
      url: media.url,
      mediaId: media.id,
      filename: media.filename,
    });
  } catch (error) {
    console.error("Media upload error:", error);
    return res.status(500).json({ error: "Upload failed" });
  }
}
