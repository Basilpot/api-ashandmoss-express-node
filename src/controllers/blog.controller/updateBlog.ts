import prisma from "@/lib/prisma";
import { UpdateBlogValidator } from "@/validations/blog/blog.validator";
import express from "express";

export const updateBlog = async (
  req: express.Request,
  res: express.Response,
) => {
  const slug = req.params.slug;
  const data = req.body;

  if (!slug) {
    return res.status(404).json({ message: "Slug is required!" });
  }

  const blogExist = await prisma.blog.findFirst({
    where: { slug },
  });

  if (!blogExist) {
    return res.status(404).json({ message: "Blog not found" });
  }

  const { category, ...otherData } = data;

  const parsed = UpdateBlogValidator.safeParse({ ...otherData });

  if (parsed.error) {
    return res.status(400).json({
      message: parsed.error.issues.map((i) => i.message).join(", "),
    });
  }

  const categoryConnect = category ? { connect: { id: category } } : undefined;

  const foundCategory = await prisma.infoPageCategory.findFirst({
    where: { id: category },
  });

  if (!foundCategory) {
    return res.status(404).json({
      message: "No category found!",
    });
  }

  const postType = foundCategory.categoryHandle == "blog";

  const canonicalUrl = postType ? `/blog/${slug}` : `/travel-guide/${slug}`;

  const push: string[] = [];

  if (blogExist.canonicalUrl) {
    if (blogExist.canonicalUrl !== canonicalUrl) {
      push.push(blogExist.canonicalUrl);
    }
  }

  const cleanData = Object.fromEntries(
    Object.entries(parsed.data).filter(
      ([k, v]) => k !== "postType" && v !== undefined,
    ),
  );

  const updatedBlog = await prisma.blog.update({
    where: { slug },
    data: {
      ...cleanData,
      ...(categoryConnect ? { category: categoryConnect } : {}),
      published: parsed.data.published ?? blogExist.published,
      ...(parsed.data.published
        ? { publishedAt: blogExist.publishedAt ?? new Date() }
        : {}),
      canonicalUrl: canonicalUrl,
      urlHistory: { push: push },
    },
  });

  if (blogExist.slug !== req.body.slug) {
    const redirect = await prisma.redirect.create({
      data: {
        to: `/${req.body.slug}`,
        from: `/${blogExist.slug}`,
        permanent: true,
      },
    });

    if (!redirect) {
      console.log("Failed to create a redirect.");
    } else {
      console.log("Redirect created successfully.");
    }
  }

  return res.status(200).json({
    message: "Blog updated successfully!",
    blog: updatedBlog,
  });
};
