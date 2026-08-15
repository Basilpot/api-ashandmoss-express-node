import { Request, Response } from "express";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/utils/email";
import { userSchema } from "@/validations/user/user.validator";
import messages from "@/constants/messages.constant";
import jwt from "jsonwebtoken";
import { EnvConfig } from "@/configs/env.config";

export async function registerUser(req: Request, res: Response) {
  const { username, name, email, password } = req.body;

  const parsed = userSchema.safeParse({ email, username, password, name });

  if (!parsed.success) {
    return res.status(400).json({
      message: messages.invalidBody,
      errors: parsed.error.issues.map((i) => i.message),
    });
  }

  const existingUser = await prisma.user.findFirst({
    where: { email },
  });

  if (existingUser) {
    return res.status(400).json({
      message: messages.userExists,
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
      name,
    },
    select: {
      email: true,
      id: true,
      username: true,
      name: true,
    },
  });

  if (!user) {
    return res.status(500).json({
      message: messages.failedToCreate,
    });
  }
  const token = jwt.sign({ ...user }, EnvConfig.JWT_SECRET, {
    expiresIn: "10m",
  });

  void sendEmail({
    to: email,
    subject: "Verify your account!",
    text: `
    Here is the link for verifying your account: <br/>
    ${EnvConfig.VERIFICATION_LINK}/${token}`,
  }).catch((e) => console.error("Verification email failed to send:", e));

  return res.status(201).json({
    message: messages.created,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
}
