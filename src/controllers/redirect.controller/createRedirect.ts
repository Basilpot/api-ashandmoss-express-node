import express from "express";
import prisma from "@/lib/prisma";

export const createRedirect = async (
  req: express.Request,
  res: express.Response,
) => {
  const { from, to, permanent } = req.body;

  if (!from || !to) {
    return res.status(400).json({
      message: "Both from and to fields are required",
    });
  }

  const redirectExists = await prisma.redirect.findFirst({
    where: { from },
  });

  if (redirectExists) {
    const updateRedirect = await prisma.redirect.update({
      where: {
        id: redirectExists.id,
      },
      data: {
        to,
        permanent: permanent ?? true,
      },
    });

    if (!updateRedirect) {
      return res.status(500).json({
        message:
          "Something went wrong on our end. We're working on fixing it as quickly as possible. Please refresh the page or come back later.",
      });
    }
    return res.status(200).json({
      message: "Redirect updated successfully",
      data: updateRedirect,
    });
  }

  const redirect = await prisma.redirect.create({
    data: {
      from,
      to,
      permanent,
    },
  });

  if (!redirect) {
    return res.status(500).json({
      message:
        "Something went wrong on our end. We’re working on fixing it as quickly as possible. Please refresh the page or come back later.",
    });
  }

  res.status(201).json({
    message: "Redirect created successfully",
    data: redirect,
  });
};
