import { Request, Response } from "express";
import prisma  from "@lib/prisma";
import messages from "@/constants/messages.constant";

export async function deleteReview(req: Request, res: Response) {
  const reviewId = Number(req.params.id);
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      message: messages.unAuthorized,
    });
  }

  const review = await prisma.review.findUnique({
    where: { id: reviewId, reviewerId: userId },
  });

  if (!review) {
    return res.status(404).json({
      message: messages.dataNotFound,
    });
  }

  const response = await prisma.review.delete({
    where: { id: reviewId },
  });

  if (!response) {
    return res.status(500).json({
      message: messages.failedToDelete,
    });
  }

  return res.status(204).json({
    message: messages.dataDeleted
  });
}
