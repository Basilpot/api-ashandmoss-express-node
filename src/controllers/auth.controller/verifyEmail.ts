import { Request, Response } from "express";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { EnvConfig } from "@/configs/env.config";
import { EmailTokenPayload } from "@/types/emailTokenPayload";
import messages from "@/constants/messages.constant";
import { StatusCodes } from "@/constants/statusCodes.constant";

export async function verifyEmail(req: Request, res: Response) {
  const token = req.params.token as string;

  let decoded: EmailTokenPayload;
  try {
    decoded = jwt.verify(token, EnvConfig.JWT_SECRET) as EmailTokenPayload;
  } catch {
    return res.status(400).json({
      message: messages.invalidToken,
    });
  }

  if (!decoded) {
    return res.status(400).json({
      message: messages.invalidToken,
    });
  }

  if (!decoded?.id && !decoded?.email) {
    return res.status(400).json({
      message: messages.invalidAuth,
    });
  }

  if (decoded.id) {
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(404).json({
        message: messages.invalidEmail,
      });
    }

    if (user.emailVerified) {
      return res.status(StatusCodes.CONFLICT).json({
        message: messages.userAlreadyVerified,
      });
    }

    await prisma.user.update({
      where: { id: decoded.id },
      data: {
        emailVerified: true,
      },
    });

    return res.status(200).json({
      message: messages.emailVerified,
    });
  }

  return res.status(400).json({
    message: messages.invalidAuth,
  });
}
