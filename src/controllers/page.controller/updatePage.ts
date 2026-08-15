import prisma from "@/lib/prisma";
import express from "express";

export const updatePage = async (
  req: express.Request,
  res: express.Response,
) => {
  const id = req.params.id;

  if (!id) {
    return res.status(404).json({
      message: "Invalid Id provided. ",
    });
  }

  const page = await prisma.infoPage.findUnique({
    where: {
      id,
    },
  });

  if (!page) {
    return res.status(404).json({
      message: "page with that id not found",
    });
  }

  const updatedPage = await prisma.infoPage.update({
    where: {
      id,
    },
    data: {
      ...req.body,
    },
  });

  if (!updatedPage) {
    return res.status(500).json({
      message:
        "Oops! Something went wrong! Help us improve your experience by sending an error report.",
    });
  }

  res.status(200).json(updatedPage);
};
