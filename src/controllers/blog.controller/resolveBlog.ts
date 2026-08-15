import prisma from "@/lib/prisma";
import express from "express";

export async function resolveBlog(
  req: express.Request,
  res: express.Response
) {
  const slug = req.params.slug as string;

  if(!slug){
    return res.status(404).json({ message: "Blog not found" });
  }

  const blog = await prisma.blog.findFirst({
    where: { slug },
  });

  if (!blog) {
    return res.status(404).json({ message: "Blog not found" });
  }

  return res.status(200).json({
    exists: true,
    canonicalPath: `/blog/${blog.slug}`,
  });
}
