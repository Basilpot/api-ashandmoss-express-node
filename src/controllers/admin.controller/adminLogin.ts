import { Request, Response } from "express";
import prisma from "@/lib/prisma";
import { adminLoginValidator } from "@/validations/admin/adminValidator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { EnvConfig } from "@/configs/env.config";
import messages from "@/constants/messages.constant";

export async function adminLogin(req: Request, res: Response) {
  const { email, password } = req.body;

  const parsed = adminLoginValidator.safeParse({ email, password });

  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: messages.invalidBody, errors: parsed.error.issues.map((i) => i.message) });
  }

  const admin = await prisma.admin.findUnique({
    where: { email },
  });

  if (!admin) {
    return res.status(400).json({ message: messages.invalidBody });
  }

  const isPasswordValid = await bcrypt.compare(password, admin.password);

  if (!isPasswordValid) {
    return res.status(400).json({ messages: "Invalid Password" });
  }

  const token = jwt.sign(
    { id: admin.id, email: admin.email, role: admin.role },
    EnvConfig.JWT_SECRET,
    { expiresIn: EnvConfig.JWT_EXPIRY },
  );

  // const cookieOptions: any = {
  //   httpOnly: true
  //   secure: EnvConfig.NODE_ENV === "prod",
  //   sameSite: EnvConfig.NODE_ENV === "prod" ? "none" : "lax",
  //   maxAge: EnvConfig.COOKIE_AGE,
  //   path: "/",
  // };
  // const isProd = EnvConfig.NODE_ENV === "production";

  const isProduction = EnvConfig.NODE_ENV === "production";

  const cookieOptions: any = {
    httpOnly: true,
    path: "/",
    maxAge: EnvConfig.COOKIE_AGE,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
  };

  if (isProduction && EnvConfig.COOKIE_DOMAIN) {
    cookieOptions.domain = EnvConfig.COOKIE_DOMAIN;
  }

  res.cookie("admin_auth_token", token, cookieOptions);

  return res.status(200).json({
    message: messages.validLogin,
    token: token,
    admin: {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
    },
  });
}
