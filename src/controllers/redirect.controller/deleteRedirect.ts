import express from "express";
import prisma from "@/lib/prisma";

export const deleteRedirect = async (
  req: express.Request,
  res: express.Response,
) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      message: "Redirect id is required",
    });
  }

  const redirect = await prisma.redirect.findFirst({
    where: {
      id,
    },
  });

  if (!redirect) {
    return res.status(404).json({
      message: "Redirect not found",
    });
  }

  await prisma.redirect.delete({
    where: {
      id,
    },
  });

  res.status(200).json({
    message: "Redirect deleted successfully",
  });
};
