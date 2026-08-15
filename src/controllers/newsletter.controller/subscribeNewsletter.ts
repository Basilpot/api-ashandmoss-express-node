import prisma from "@/lib/prisma";
import { newsLetterSubscribedEmailTemplate } from "@/utils/newsletterSubscribedEmailTemplate";
import { sendEmail } from "@/utils/email";
import express from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";

export default async function subscribeNewsletter(
  req: express.Request,
  res: express.Response
) {
  const { email } = req.body;
  const parsed = z.email().safeParse(email);

  if (parsed.error) {
    return res.status(400).json({
      message: parsed.error.issues.map((i) => i.message).join(", "),
    });
  }

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  const userAlreadySubscribed = await prisma.newsletterSubscriber.findFirst({
    where: { email },
  });

  if (userAlreadySubscribed) {
    return res
      .status(409)
      .json({ message: "You're already on a mailing list." });
  }

  const unsubSecret = jwt.sign({ email }, process.env.EMAIL_UNSUB_SECRET!);

  const newSubscriber = await prisma.newsletterSubscriber.create({
    data: {
      email,
      unsubSecret,
    },
  });

  if (!newSubscriber) {
    return res
      .status(500)
      .json({ message: "Failed to subscribe to newsletter." });
  }

  await sendEmail({
    to: email,
    subject: "Welcome to My Easy Guide Newsletter! 🎉",
    text: newsLetterSubscribedEmailTemplate(email, unsubSecret),
  });

  return res.status(201).json({
    message: "Successfully subscribed to newsletter.",
    data: newSubscriber,
  });
}
