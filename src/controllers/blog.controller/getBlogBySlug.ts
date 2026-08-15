import prisma from "@/lib/prisma";
import express from "express";

export const getBlogBySlug = async (req: any, res: express.Response) => {
  const slug = req.params.slug?.toString();

  if (!slug) {
    return res.status(400).json({
      message: "Bad request, slug is required!",
    });
  }

  const isAdmin = !!req.user;

  const blog = await prisma.blog.findFirst({
    where: {
      OR: [{ slug: slug }, { urlHistory: { has: slug } }],
    },
    include: {
      writer: {
        select: {
          id: true,
          name: true,
          username: true,
          bio: true,
          image: true,
          createdAt: true,
        },
      },
      category: true,
    },
  });

  if (!blog) {
    return res.status(404).json({
      message: "Blog not found",
    });
  }

  if (blog.inTrash && !isAdmin) {
    return res.status(404).json({
      message: "Blog not found",
    });
  }

  // if (!blog?.canonicalUrl) {
  //   return res.redirect(301, `/blog/${blog.category?.slug}/${blog.slug}`);
  // }

  // const visitedSlug = slug;
  // if (blog?.urlHistory?.some((url) => url.endsWith(visitedSlug))) {
  //   return res.redirect(301, blog.canonicalUrl);
  // }

  return res.status(200).json(blog);
};
