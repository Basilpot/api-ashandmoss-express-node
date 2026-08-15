import express from "express";
import prisma from "@/lib/prisma";

export const getAuthorByUsername = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({
        message: "Username is required",
      });
    }

    const author = await prisma.author.findFirst({
      where: { username },
      include: {
        blogs: {
          where: { inTrash: false },
        },
      },
    });

    if (!author) return res.status(404).json({ message: "Author not found" });

    return res.json(author);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
