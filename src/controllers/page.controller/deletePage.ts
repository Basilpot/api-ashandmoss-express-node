import express from "express";
import prisma from "@/lib/prisma";

export const deletePage = async (
  req: express.Request,
  res: express.Response,
) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({
      message: "Invalid Id provided. ",
    });
  }

  const page = await prisma.infoPage.findFirst({
    where: {
      id,
    },
  });

  if (!page) {
    return res.status(404).json({
      message: "page with that id not found",
    });
  }

  await prisma.infoPage.delete({
    where: {
      id,
    },
  });

  res.status(200).json({
    message: "page deleted successfully",
    data: {
      id: page.id,
      slug: page.slug,
    },
  });
};
