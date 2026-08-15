import messages from "@/constants/messages.constant";
import prisma from "@/lib/prisma";
import { slugify } from "@/utils/slugify";
import { Request, Response } from "express";
import { CreateBlogValidator } from "@/validations/blog/blog.validator";

export async function createBlog(req: Request, res: Response) {
  const data = req.body;

  const validatedData = CreateBlogValidator.safeParse(data);
  const categoryId = data.category;

  const category = await prisma.infoPageCategory.findFirst({
    where: { id: categoryId },
  });

  if (!category) {
    return res.status(404).json({
      message: "Category not found",
    });
  }

  const slug = slugify(data.slug);

  if (!validatedData.success) {
    return res.status(400).json({
      message: messages.badRequest,
      error: validatedData.error,
    });
  }

  const canonicalUrl = `/blog/${slug}`;

  const blogData = Object.fromEntries(
    Object.entries(validatedData.data).filter(
      ([k, v]) => k !== "postType" && v !== undefined,
    ),
  );

  const newBlog = await prisma.blog.create({
    data: {
      ...blogData,
      blogCategoryId: category.id,
      slug: slug,
      content: validatedData.data.content,
      published: validatedData.data.published,
      publishedAt: validatedData.data.published ? new Date() : null,
      createdAt: data.createdAt,
      canonicalUrl: canonicalUrl,
    },
  });

  if (!newBlog) {
    return res.status(500).json({ message: "Something went wrong" });
  }

  return res.status(201).json({
    message: "Blog created successfully!",
    newBlog,
  });
}
