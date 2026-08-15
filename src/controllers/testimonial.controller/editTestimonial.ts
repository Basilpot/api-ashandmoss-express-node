import prisma from "@/lib/prisma";
import { Request, Response } from "express";

const editTestimonial = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Testimonial ID is required" });
  }

  const { author, content, rating, media } = req.body;

  try {
    const existing = await prisma.testimonial.findFirst({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        author: author,
        content: content,
        rating: rating,
        media: media,
      },
    });
    res.status(200).json(testimonial);
  } catch {
    res.status(500).json({ message: "Failed to update testimonial" });
  }
};

export default editTestimonial;
