import express from "express";
import prisma from "@/lib/prisma";
import messages from "@/constants/messages.constant";

export const getPageBySlug = async (
  req: express.Request,
  res: express.Response,
) => {
  const { slug } = req.params;

  const slugExistInRedirect = await prisma.redirect.findFirst({
    where: {
      from: `/${slug}`,
    },
  });

  if (slugExistInRedirect) {
    return res.status(301).redirect(slugExistInRedirect.to);
  }

  if (!slug) {
    return res.status(400).json({
      message: "Slug is required attribute.",
    });
  }

  const page = await prisma.infoPage.findFirst({
    where: { slug },
  });

  if (!page) {
    return res.status(404).json({ message: "page not found" });
  }

  res.status(200).json({
    message: messages.dataFetched,
    data: page,
  });
};
