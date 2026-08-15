import { Request, Response } from "express";
import prisma from "@/lib/prisma";

const deleteTestimonial = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Testimonial ID is required" });
  }

  try {
    const existing = await prisma.testimonial.findFirst({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    await prisma.testimonial.delete({
      where: { id },
    });
    res.status(200).json({ message: "Testimonial deleted successfully" });
  } catch {
    res.status(500).json({ message: "Error deleting testimonial" });
  }
};

export default deleteTestimonial;
