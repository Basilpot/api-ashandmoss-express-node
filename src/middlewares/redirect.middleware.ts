import express from "express";
import prisma from "@/lib/prisma";

export const redirectMiddleware = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  // Strip /slug or /published prefix to get the bare slug
  const pathWithoutSegment = req.path
    .replace(/^\/slug/, "")
    .replace(/^\/blogs/, "");

  // If nothing was stripped, this path isn't slug-based — skip
  // if (pathWithoutSegment === req.path) return next();

  const redirect = await prisma.redirect.findFirst({
    where: { from: pathWithoutSegment },
  });

  if (redirect) {
    const destination = req.path.replace(pathWithoutSegment, redirect.to);
    return res.redirect(redirect.permanent ? 301 : 302, destination);
  }

  next();
};
