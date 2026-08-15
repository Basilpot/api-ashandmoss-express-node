import { z } from "zod";

export const CreateTripCategoryValidator = z.object({
  categoryHandle: z.string(),
  categoryName: z.string().optional(),
  categoryImage: z.string().optional(),
});

export const UpdateTripCategoryValidator =
  CreateTripCategoryValidator.partial();
