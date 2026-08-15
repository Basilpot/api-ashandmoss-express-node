import { Request, Response } from "express";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/utils/email";
import messages from "@/constants/messages.constant";
import { EnvConfig } from "@/configs/env.config";
import jwt from "jsonwebtoken";

export async function forgetPassword(req: Request, res: Response) {
  const { email } = req.body;

  const user = await prisma.user.findFirst({
    where: { email },
    select: {
      id: true,
      email: true,
      username: true,
    },
  });

  if (!user) {
    return res.status(404).json({
      message: messages.dataNotFound,
    });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, EnvConfig.JWT_SECRET, {
    expiresIn: "10m",
  });

  void sendEmail({
    to: email,
    subject: "Forget Password?",
    text: `Here is the link for resetting your password
               ${EnvConfig.RESET_LINK}/${token}`,
  }).catch((e) => console.error("Reset email failed to send:", e));

  return res.status(200).json({
    message: "A email with rest link has been sent to your email address.",
  });
}
