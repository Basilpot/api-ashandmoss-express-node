import express from "express";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { UpdateAuthorValidator } from "@/validations/author/author.validator";

export const updateAuthor = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({
        message: "Username is required",
      });
    }

    const body = req.body;

    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10);
    }

    const parsedData = UpdateAuthorValidator.safeParse(body);

    if (parsedData.error) {
      return res.status(400).json({
        message: parsedData.error.issues[0]?.message ?? "Invalid input",
      });
    }

    const updated = await prisma.author.update({
      where: { username },
      // @ts-expect-error some type issues
      data: { ...parsedData.data },
    });

    return res.json({ message: "Author updated!", data: updated });
  } catch (err: any) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Author not found" });
    }
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
