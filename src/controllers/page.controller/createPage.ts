import { slugify } from "@/utils/slugify";
import prisma from "@/lib/prisma";
import express from "express";

export const createPage = async (
  req: express.Request,
  res: express.Response,
) => {
  const { slug, published } = req.body;

  const slugifiedSlug = slugify(slug);

  const newPage = await prisma.infoPage.create({
    data: {
      slug: slugifiedSlug,
      published: published ?? false,
      ...req.body,
    },
  });

  if (!newPage) {
    res.status(500).json({ error: "Failed to create page" });
  } else {
    res
      .status(201)
      .json({ message: "Page created successfully", data: newPage });
  }
};
