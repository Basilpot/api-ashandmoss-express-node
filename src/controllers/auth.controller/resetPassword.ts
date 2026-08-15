import { Request, Response } from "express";
import prisma from "@/lib/prisma";
import { EnvConfig } from "@/configs/env.config";
import { EmailTokenPayload } from "@/types/emailTokenPayload";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import messages from "@/constants/messages.constant";

export async function resetPassword(req: Request, res: Response) {
  const token = req.params.token!;

  const decoded = jwt.verify(token, EnvConfig.JWT_SECRET) as EmailTokenPayload;

  const { password } = req.body;

  if (!decoded?.id) {
    return res.status(401).json({
      message: messages.invalidToken,
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
  });

  if (!user) {
    return res.status(401).json({
      message: "No user!",
    });
  }

  const updatedUser = await prisma.user.update({
    where: { id: decoded.id },
    data: {
      password: await bcrypt.hash(password, 10),
    },
  });

  if (!updatedUser) {
    return res.status(500).json({
      message: messages.failedToChangePassword,
    });
  }

  return res.status(200).json({
    message: messages.passwordUpdated,
  });
}
