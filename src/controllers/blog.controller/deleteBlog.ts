import prisma from "@/lib/prisma";
import express from "express";

export async function deleteBlog(req: express.Request, res: express.Response) {
  const blogId = req.params.id;
  const { permanent } = req.query;

  const permanentlyDelete = permanent === "true";

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

  let finalResponse;

  if (permanentlyDelete) {
    finalResponse = await prisma.blog.delete({
      where: { id: blogId },
    });
  } else {
    finalResponse = await prisma.blog.update({
      where: { id: blogId },
      data: {
        inTrash: true,
      },
    });
  }

  if (!finalResponse) {
    return res.status(500).json({
      messages: "Something went wrong!",
    });
  }

  return res.status(200).json({
    message: "Blog deleted successfully!",
  });
}
