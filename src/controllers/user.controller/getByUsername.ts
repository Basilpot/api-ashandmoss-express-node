import { Request, Response } from "express";
import prisma from "@/lib/prisma";
import messages from "@/constants/messages.constant";

export async function getByUsername(req: Request, res: Response) {
  const userName = req.params.username;

  const user = await prisma.user.findFirst({
    where: { username: userName! },
  });

  if (!user) {
    return res.status(404).json({
      message: messages.dataNotFound, 
    });
  }

  return res.status(200).json({
    user: {
      id: user?.id,
      username: user?.username,
      name: user?.name,
      bio: user?.bio,
      createdAt: user?.createdAt,
      image: user?.image,
      phone: user?.phone,
      email: user?.email,
    },
  });
}
