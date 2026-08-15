import { Request, Response } from "express";
import prisma from "@/lib/prisma";
import messages from "@/constants/messages.constant";
import { CreateReviewValidator } from "@/validations/review/reviewValidator";

export async function createReview(req: Request, res: Response) {
  const userId = req.user?.id;
  const productId = Number(req.body.productId);
  const data = req.body;

  if (!userId || !productId) {
    return res.status(401).json({
      message: messages.unAuthorized,
    });
  }

  const product = await prisma.product.findFirst({
    where: { id: productId },
  });

  if (!product) {
    return res.status(404).json({
      message: messages.dataNotFound,
    });
  }

  const requiredData = CreateReviewValidator.safeParse(data);

  if (!requiredData.success) {
    return res.status(400).json({
      message: messages.badRequest,
      error: requiredData.error,
    });
  }

  const review = await prisma.review.create({
    data: {
      ...requiredData.data,
      reviewerId: userId,
    },
  });

  if (!review) {
    return res.status(500).json({
      message: messages.failedToFetch,
    });
  }

  return res.status(200).json({
    message: messages.created,
    review,
  });
}
