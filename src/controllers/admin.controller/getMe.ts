import { Request, Response } from "express";
import prisma from "@/lib/prisma";
import messages from "@/constants/messages.constant";

export async function getMe(req: Request, res: Response) {
  const admin = await prisma.admin.findUnique({
    where: { id: (req.user as any).id },
    select: { id: true, username: true, email: true, role: true, createdAt: true },
  });

  if (!admin) {
    return res.status(404).json({ message: messages.dataNotFound });
  }

  return res.status(200).json({ message: messages.dataFetched, data: { admin } });
}
