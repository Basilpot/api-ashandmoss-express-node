import prisma from "@/lib/prisma";
import express from "express";

export async function restoreBlog(req: express.Request, res: express.Response) {
  const blogId = req.params.id;

  if (!blogId)
    return res.status(204).json({
      message: "No id provided!",
    });

  const blogExist = await prisma.blog.findFirst({
    where: { id: blogId },
  });

  if (!blogExist) {
    return res.status(204).json({
      message: "No item found for specified Id",
    });
  }

  const finalResponse = await prisma.blog.update({
    where: { id: blogId },
    data: {
      inTrash: false,
    },
  });

  if (!finalResponse) {
    return res.status(500).json({
      messages: "Something went wrong!",
    });
  }

  return res.status(200).json({
    message: "Blog Restored!",
  });
}
