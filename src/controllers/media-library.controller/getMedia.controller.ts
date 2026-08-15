import express from "express";
import prisma from "@/lib/prisma";

export async function getMedia(
  req: express.Request,
  res: express.Response,
) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Media ID is required" });
    const data = await prisma.media.findFirst({
      where: { id },
    });

    if (!data) {
      return res.status(404).json({ message: "Media not found" });
    }

    return res.status(200).json({ data });
  } catch (error) {
    console.error("Get media error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
