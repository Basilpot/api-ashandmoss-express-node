import prisma from "@/lib/prisma";
import express from "express";

export default async function listNewsletter(
  req: express.Request,
  res: express.Response,
) {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: {},
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, isActive: true, createdAt: true, unsubscribedAt: true },
  });

  return res.status(200).json({
    success: true,
    data: subscribers,
  });
}
