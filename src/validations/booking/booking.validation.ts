import { z } from "zod";

export const CreateBookingValidation = z.object({
  activityId: z.coerce.number(),
  userId: z.coerce.number(),
  startDate: z.date(),
  endDate: z.date(),
  days: z.coerce.number(),
  groupSize: z.coerce.number(),
  totalPrice: z
    .number()
    .multipleOf(0.01, { message: "Price must have upto two decimal places." }),
});

export const UpdateBookingValidation = CreateBookingValidation.partial();
