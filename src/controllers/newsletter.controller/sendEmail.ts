import prisma from "@/lib/prisma";
import { sendEmail } from "@/utils/email";
import { EnvConfig } from "@/configs/env.config";
import express from "express";

export default async function sendNewsletterEmail(
  req: express.Request,
  res: express.Response,
) {
  const { subject, content } = req.body;
  const users = await prisma.newsletterSubscriber.findMany({
    where: {},
  });

  for (const user of users) {
    await sendEmail({
      to: user.email,
      subject: subject ?? "Newsletter",
      ...(EnvConfig.EMAIL_DISPLAY_NAME
        ? { displayName: EnvConfig.EMAIL_DISPLAY_NAME }
        : {}),
      text:
        content ??
        `Hello! Here is the latest newsletter from ${
          EnvConfig.EMAIL_DISPLAY_NAME ?? "our team"
        }. Stay tuned for more updates!`,
    });
  }

  return res
    .status(200)
    .json({ message: "Newsletter emails sent successfully." });
}
