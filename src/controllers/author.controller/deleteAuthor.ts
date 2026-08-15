import prisma from "@/lib/prisma";
import express from "express";

export const deleteAuthor = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Id is required.",
      });
    }

    const author = await prisma.author.findFirst({
      where: { id },
    });

    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    await prisma.author.delete({
      where: { id },
    });

    return res.json({ message: "Author deleted successfully" });
  } catch (err: any) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Author not found" });
    }
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
