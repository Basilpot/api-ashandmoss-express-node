import { slugify } from "@/utils/slugify";
import { CreateTagValidator } from "@/validations/tag";
import express from "express";
import prisma from "@/lib/prisma";

export async function createTag(req: express.Request, res: express.Response) {
  const body = req.body;

  if (!body.name || !body.slug) {
    return res.status(400).json({
      message: "Tag name or slug is missing.",
    });
  }

  const parsed = CreateTagValidator.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: parsed.error.issues.map((i) => i.message).join(", "),
    });
  }

  const tagSlug = slugify(parsed.data.slug);

  const tagExist = await prisma.tag.findUnique({
    where: { slug: tagSlug },
    select: { id: true },
  });

  if (tagExist) {
    return res.status(409).json({
      message: "Tag with same slug already exists.",
    });
  }

  const newTag = await prisma.tag.create({
    data: {
      name: parsed.data.name,
      slug: tagSlug,
      description: parsed.data.description ?? null,
    },
  });

  return res.status(201).json({
    message: "New tag added successfully!",
    data: { tag: newTag },
  });
}
