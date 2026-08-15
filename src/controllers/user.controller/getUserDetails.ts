import { Request, Response } from "express";
import prisma from "@/lib/prisma";
import messages from "@/constants/messages.constant";

export async function getUserDetails(req: Request, res: Response) {
  const user = await prisma.user.findFirst({
    where: { id: req.user?.id },
    select: {
      id: true,
      email: true,
      image: true,
      name: true,
      phone: true,
      bio: true,
      dateOfBirth: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    return res.status(404).json({ message: messages.dataNotFound });
  }

  return res.json({
    message: "Profile Information fetched",
    data: user,
  });
}
