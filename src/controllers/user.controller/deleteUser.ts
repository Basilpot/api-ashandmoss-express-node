import { Request, Response } from "express";
import prisma from "@/lib/prisma";
import messages from "@/constants/messages.constant";

export async function deleteUser(req: Request, res: Response) {
  const userId = Number(req.params.id);

  const user = await prisma.user.findFirst({
    where: { id: userId },
  });
  if (!user) {
    return res.status(404).json({ message: messages.dataNotFound });
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  return res.status(204).json({
    message: messages.dataDeleted,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.name,
    },
  });
}
