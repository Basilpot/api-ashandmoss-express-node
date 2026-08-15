import express from "express";
import prisma from "@/lib/prisma";
import { saveLocalFile } from "@/images/local-upload";
import sharp from "sharp";
import { convertToWebP } from "@/lib/sharp";

const EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  avif: "image/avif",
};

export async function uploadMediaMultiple(
  req: express.Request,
  res: express.Response,
) {
  try {
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const results = await Promise.all(
      files.map(async (file) => {
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

        const r = await saveLocalFile(file, "media");
        if (!r.success || !r.url || !r.filename) {
          return { url: "", mediaId: "", filename: "", error: r.error };
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

        const ext = r.filename.split(".").pop()?.toLowerCase() || "";

        const media = await prisma.media.create({
          data: {
            url: r.url,
            filename: r.filename,
            mimeType: EXT_TO_MIME[ext] || file.mimetype || null,
            fileSize: file.size,
            width,
            height,
          },
        });

        return { url: media.url, mediaId: media.id, filename: media.filename };
      }),
    );

    return res.status(200).json({ result: results });
  } catch (error) {
    console.error("Media multiple upload error:", error);
    return res.status(500).json({ error: "Upload failed" });
  }
}
