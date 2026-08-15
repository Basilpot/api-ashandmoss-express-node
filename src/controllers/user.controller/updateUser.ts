import { Request, Response } from "express";
import prisma from "@/lib/prisma";
import { UpdateUserSchema } from "@/validations/user/user.validator";
import messages from "@/constants/messages.constant";

export async function updateUser(req: Request, res: Response) {
  const data = req.body;

  const userId = req?.user?.id;

  if (!userId) {
    return res.status(401).json({ message: messages.unAuthorized });
  }

  const userExist = await prisma.user.findFirst({
    where: { id: userId },
  });

  if (!userExist) {
    return res.status(404).json({
      message: "user not found",
    });
  }

  const parsed = UpdateUserSchema.safeParse({ data });

  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: messages.invalidBody, errors: parsed.error.issues.map((i) => i.message) });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...finalData } = data;
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...finalData,
    },
  });

  if (!user) {
    return res.status(500).json({ message: messages.failedToUpdate });
  }

  return res.json({
    message: messages.dataUpdated,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
}
