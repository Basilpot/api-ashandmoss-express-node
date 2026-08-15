import express from "express";
import prisma from "@/lib/prisma";

export async function createMedia(
  req: express.Request,
  res: express.Response,
) {
  try {
    const { url, filename, alt, caption, title, description, mimeType, fileSize, width, height } = req.body;

    if (!url || !filename) {
      return res.status(400).json({ message: "url and filename are required" });
    }

    const data = await prisma.media.create({
      data: {
        url,
        filename,
        alt: alt || null,
        caption: caption || null,
        title: title || null,
        description: description || null,
        mimeType: mimeType || null,
        fileSize: fileSize ? parseInt(String(fileSize), 10) : null,
        width: width ? parseInt(String(width), 10) : null,
        height: height ? parseInt(String(height), 10) : null,
      },
    });

    return res.status(201).json({ data });
  } catch (error) {
    console.error("Create media error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
