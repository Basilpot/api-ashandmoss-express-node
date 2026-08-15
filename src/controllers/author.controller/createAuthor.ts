import { Request, Response } from "express";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { CreateAuthorValidator } from "@/validations/author/author.validator";

export const createAuthor = async (req: Request, res: Response) => {
  try {
    const { username, name, email, password, bio, image } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const existing = await prisma.author.findFirst({
      where: { email },
    });
    if (existing) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const parsedData = CreateAuthorValidator.safeParse({
      username,
      name,
      email,
      password,
      bio,
      image,
    });

    if (parsedData.error) {
      return res.status(400).json({
        message: parsedData.error.issues[0]?.message ?? "Invalid input",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const author = await prisma.author.create({
      // @ts-expect-error some type issues
      data: {
        ...parsedData.data,
        password: hashedPassword,
      },
    });

    return res.status(201).json(author);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
