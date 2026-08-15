import { z } from "zod";

export const CreateNewsletterSubscriberValidator = z.object({
  email: z.email(),
  unsubSecret: z.string(),
  isActive: z.boolean().default(true).optional(),
  unsubscriedAt: z.date().optional(),
});

export const UpdateNewsLetterSubscriberValidator = CreateNewsletterSubscriberValidator.partial();
