import express from "express";
import prisma from "@/lib/prisma";
import messages from "@/constants/messages.constant";

export const getAllPages = async (
  req: express.Request,
  res: express.Response,
) => {
  const pages = await prisma.infoPage.findMany({});

  if (pages.length < 1) {
    return res.status(404).json({ message: "No pages found", data: [] });
  }

  res.json({ message: messages.dataFetched, data: pages });
};
