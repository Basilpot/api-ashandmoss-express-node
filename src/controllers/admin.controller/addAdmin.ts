import { Request, Response } from "express";
import { adminValidator } from "@/validations/admin/adminValidator";
import messages from "@/constants/messages.constant";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function addAdmin(req: Request, res: Response) {
  const data = req.body;

  const parsed = adminValidator.safeParse({ data });
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: messages.invalidBody, errors: parsed.error.issues.map((i) => i.message) });
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const newAdmin = await prisma.admin.create({
    data: {
      ...data,
      password: hashedPassword,
    },
  });

  if (!newAdmin) {
    return res.status(500).json({ message: messages.failedToCreate });
  }

  return res.status(201).json({
    messages: messages.adminCreated,
    admin: {
      id: newAdmin.id,
      username: newAdmin.username,
      email: newAdmin.email,
      role: newAdmin.role,
    },
  });
}