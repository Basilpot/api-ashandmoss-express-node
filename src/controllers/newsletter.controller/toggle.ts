import prisma from "@/lib/prisma";
import express from "express";

export default async function toggleSubscriber(
  req: express.Request,
  res: express.Response,
) {
  const id = req.params.id as string;

  const sub = await prisma.newsletterSubscriber.findFirst({
    where: { id },
  });
  if (!sub) {
    return res.status(404).json({ message: "Subscriber not found" });
  }

  const updated = await prisma.newsletterSubscriber.update({
    where: { id },
    data: {
      isActive: !sub.isActive,
      unsubscribedAt: sub.isActive ? new Date() : null,
    },
  });

  return res.status(200).json({ success: true, data: updated });
}
