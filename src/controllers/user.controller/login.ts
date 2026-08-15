import { Request, Response } from "express";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { EnvConfig } from "@/configs/env.config";
import { userLoginSchema } from "@/validations/user/user.validator";
import jwt from "jsonwebtoken";
import messages from "@/constants/messages.constant";

export async function userLogin(req: Request, res: Response) {
  const { email, password } = req.body;

  const parsed = userLoginSchema.safeParse({ email, password });

  if (!parsed.success) {
    return res.status(400).json({
      message: messages.invalidBody,
      errors: parsed.error.issues.map((i) => i.message),
    });
  }

  const user = await prisma.user.findFirst({
    where: { email },
  });

  if (!user) {
    return res.status(400).json({
      message: messages.invalidAuth,
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(400).json({
      message: messages.invalidAuth,
    });
  }

  if (user && isPasswordValid) {
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      EnvConfig.JWT_SECRET,
      {
        expiresIn: EnvConfig.JWT_EXPIRY,
      },
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

    res.cookie("user_auth_token", token, cookieOptions);

    return res.status(200).json({
      message: messages.validLogin,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  }
}
