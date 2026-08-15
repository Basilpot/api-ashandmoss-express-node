import prisma from "@/lib/prisma";
import { Request, Response } from "express";

const getAllTestimonials = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [testimonials, total] = await Promise.all([
      prisma.testimonial.findMany({
        select: {
          id: true,
          author: true,
          content: true,
          rating: true,
          media: true,
          createdAt: true,
        },
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.testimonial.count(),
    ]);

    res.status(200).json({
      message: "Testimonials fetched successfully",
      data: testimonials,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.max(1, Math.ceil(total / Number(limit))),
      },
    });
  } catch {
    res.status(500).json({ message: "Failed to fetch testimonials" });
  }
};

export default getAllTestimonials;
