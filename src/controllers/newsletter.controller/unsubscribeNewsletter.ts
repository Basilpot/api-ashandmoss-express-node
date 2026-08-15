import prisma from "@/lib/prisma";
import { EnvConfig } from "@/configs/env.config";
import express from "express";
import jwt from "jsonwebtoken";

export default async function unsubscribeNewsletter(
  req: express.Request,
  res: express.Response
) {
  const unsubSecret = req.query.token;

  if (!unsubSecret) {
    return res.status(400).json({ message: "No token provided required." });
  }

  const secretIsValid = jwt.verify(
    unsubSecret as string,
    process.env.EMAIL_UNSUB_SECRET!
  );

  if (!secretIsValid) {
    return res.status(400).json({ message: "Invalid token provided." });
  }

  const subscriber = await prisma.newsletterSubscriber.findFirst({
    where: { unsubSecret: unsubSecret as string },
  });

  if (!subscriber) {
    return res.status(404).json({
      message: "You're not subscribed to our newsletter.",
    });
  }

  if (subscriber.isActive === false) {
    return res.status(409).json({
      message: "You're already unsubscribed from our newsletter.",
    });
  }

  const unsubscribedUser = await prisma.newsletterSubscriber.update({
    where: { id: subscriber.id },
    data: {
      isActive: false,
      unsubscribedAt: new Date(),
    },
  });

  if (!unsubscribedUser) {
    return res.status(500).json({
      message: "Failed to unsubscribe from newsletter. Please try again later.",
    });
  }

  return res.redirect(`${EnvConfig.FRONTEND_BASE_URL}/unsubscribed`);
}
