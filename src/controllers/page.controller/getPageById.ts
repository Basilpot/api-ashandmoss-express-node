import messages from "@/constants/messages.constant";
import prisma from "@/lib/prisma";
import express from "express";

export const getPageById = async (
  req: express.Request,
  res: express.Response,
) => {
  const { id } = req.params;

  if (!id) {
    return res.status(404).json({
      message: "No page id provided for query.",
    });
  }

  const page = await prisma.infoPage.findUnique({
    where: { id },
  });

  if (!page) {
    return res.status(404).json({
      message: "Page not found!",
    });
  }

  return res.status(200).json({
    message: messages.dataFetched,
    data: page,
  });
};
