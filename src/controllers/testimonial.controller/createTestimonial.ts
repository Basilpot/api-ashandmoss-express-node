import express from "express";
import prisma from "@/lib/prisma";

const createTestimonial = async (
  req: express.Request,
  res: express.Response,
) => {
  const { rating, content, author, media } = req.body;

  if (!content || !author) {
    res.status(400).json({ message: "Content and author are required" });
  }

  try {
    const testimonial = await prisma.testimonial.create({
      data: {
        rating,
        content,
        author,
        media,
      },
    });

    res.status(201).json(testimonial);
  } catch (error: unknown) {
    res.status(500).json({ message: "Failed to create testimonial", error });
  }
};

export default createTestimonial;
