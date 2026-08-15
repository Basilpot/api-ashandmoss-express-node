import { slugify } from "@/utils/slugify";
import { UpdateTagValidator } from "@/validations/tag";
import express from "express";
import prisma from "@/lib/prisma";

export async function updateTag(req: express.Request, res: express.Response) {
  try {
    const { slug } = req.params;
    const body = req.body;

    if (!slug) {
      return res.status(400).json({ message: "Tag slug is required" });
    }

    const parsed = UpdateTagValidator.safeParse(body);
    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues.map((i) => i.message).join(", "),
      });
    }

    const tagExist = await prisma.tag.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!tagExist) {
      return res.status(404).json({ message: "Tag not found" });
    }

    if (body.slug) {
      const newSlug = slugify(body.slug);
      if (newSlug !== slug) {
        const slugConflict = await prisma.tag.findUnique({
          where: { slug: newSlug },
          select: { id: true },
        });

        if (slugConflict) {
          return res.status(409).json({
            message: "Tag with this slug already exists",
          });
        }
      }
    }

    const data: any = {};
    if (parsed.data.name !== undefined) data.name = parsed.data.name;
    if (parsed.data.slug !== undefined) data.slug = slugify(parsed.data.slug);
    if (parsed.data.description !== undefined) {
      data.description = parsed.data.description ?? null;
    }
    data.updatedAt = new Date();

    const updatedTag = await prisma.tag.update({
      where: { slug },
      data,
    });

    return res.status(200).json({
      message: "Tag updated successfully",
      data: { tag: updatedTag },
    });
  } catch {
    return res.status(500).json({
      message: "Failed to update tag",
    });
  }
}
