import prisma from "@/lib/prisma";
import express from "express";

export async function getBlogsByAuthorId(
  req: express.Request,
  res: express.Response
) {
  const authorId = req.params.id;

  if (!authorId) {
    return res.status(400).json({
      message: "Id is required property.",
    });
  }

  const where = {
    inTrash: false,
    writerId: authorId,
  };
  const blogs = await prisma.blog.findMany({
    where: where,
    include: {
      category: true,
    },
  });

  if (!blogs) {
    return res.status(500).json({
      message: "Something went wrong while fetching the blogs.",
    });
  }

  if (blogs.length === 0) {
    return res.status(200).json({
      message: "No blogs found!",
    });
  }

  return res.status(200).json({
    message: "Blogs fetched successfully!",
    data: blogs,
  });
}
