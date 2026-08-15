import { z } from "zod";

export const CreateWishlistValidator = z.object({
  itemId: z.coerce.number(),
  userId: z.coerce.number(),
});

export const UpdateWishlistValidator = CreateWishlistValidator.partial();
