import express from "express";
import prisma from "@/lib/prisma";

export async function deleteTag(req: express.Request, res: express.Response) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Tag ID is required" });
    }

    const tagExist = await prisma.tag.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!tagExist) {
      return res.status(404).json({ message: "Tag not found" });
    }

    await prisma.tag.delete({ where: { id } });

    return res.status(200).json({
      message: "Tag deleted successfully",
    });
  } catch {
    return res.status(500).json({
      message: "Failed to delete tag",
    });
  }
}
