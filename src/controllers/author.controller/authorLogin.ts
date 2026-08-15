import express from "express";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import messages from "@/constants/messages.constant";
import jwt from "jsonwebtoken";
import { EnvConfig } from "@/configs/env.config";

export async function authorLogin(req: express.Request, res: express.Response) {
  const { email, password } = req.body;

  const author = await prisma.author.findFirst({
    where: { email },
  });

  if (!author) {
    return res.status(404).json({
      message: messages.invalidAuth,
    });
  }

  const decoded = await bcrypt.compare(password, author.password);

  if (!decoded) {
    return res.status(401).json({
      message: messages.invalidCredentials,
    });
  }

  const token = jwt.sign(
    { id: author.id, email: author.email, role: "author" },
    EnvConfig.JWT_SECRET,
    { expiresIn: EnvConfig.JWT_EXPIRY },
  );

  const cookieOptions: any = {
    httpOnly: true,
    secure: EnvConfig.NODE_ENV === "production",
    sameSite: EnvConfig.NODE_ENV === "production" ? "none" : "lax",
    maxAge: EnvConfig.COOKIE_AGE,
    path: "/",
  };

  if (EnvConfig.NODE_ENV === "production" && EnvConfig.COOKIE_DOMAIN) {
    cookieOptions.domain = EnvConfig.COOKIE_DOMAIN;
  }

  res.cookie("author_auth_token", token, cookieOptions);

  return res.status(200).json({
    message: messages.validLogin,
    token: token,
    author: {
      id: author.id,
      username: author.username,
      email: author.email,
      role: "author",
    },
  });
}
