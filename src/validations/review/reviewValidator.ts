import { z } from "zod";

export const CreateReviewValidator = z.object({
  rating: z.number().min(1).max(5),
  text: z.string().min(50).max(500),
  productId: z.coerce.number(),
});

export const UpdateReviewValidator = CreateReviewValidator.partial();
