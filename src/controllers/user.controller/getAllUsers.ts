import { Request, Response } from "express";
import prisma from "@/lib/prisma";
import { buildPaginationMeta, getPaginationParams } from "@/utils/pagination.util";

export async function getAllUsers(req: Request, res: Response) {
  const { page, limit, skip } = getPaginationParams(req);

  const [total, users] = await Promise.all([
    prisma.user.count(),
    prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phone: true,
        bio: true,
        dateOfBirth: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
      skip,
      take: limit,
      orderBy: { id: "asc" },
    }),
  ]);

  return res.json({ data: users, pagination: buildPaginationMeta(total, page, limit) });
}
