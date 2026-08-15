import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import messages from "@/constants/messages.constant";

export async function updateMe(req: Request, res: Response) {
  const adminId = (req.user as any).id;
  const { username, email, currentPassword, newPassword } = req.body;

  const admin = await prisma.admin.findUnique({ where: { id: adminId } });
  if (!admin) {
    return res.status(404).json({ message: messages.dataNotFound });
  }

  const data: Record<string, string> = {};
  if (username !== undefined) data.username = username;
  if (email !== undefined) data.email = email;

  if (newPassword) {
    if (!currentPassword || !(await bcrypt.compare(currentPassword, admin.password))) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    data.password = await bcrypt.hash(newPassword, 10);
  }

  const updated = await prisma.admin.update({
    where: { id: adminId },
    data,
    select: { id: true, username: true, email: true, role: true },
  });

  return res.status(200).json({ message: "Profile updated", data: { admin: updated } });
}
