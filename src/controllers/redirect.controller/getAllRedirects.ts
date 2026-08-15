import express from "express";
import prisma from "@/lib/prisma";
import messages from "@/constants/messages.constant";

export const getAllRedirects = async (
  req: express.Request,
  res: express.Response,
) => {
  const redirects = await prisma.redirect.findMany({
    where: {},
    select: { id: true, from: true, to: true, permanent: true },
  });

  res.status(200).json({
    message: messages.dataFetched,
    data: redirects,
  });
};
