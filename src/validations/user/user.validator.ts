import { z } from "zod";

export const userSchema = z.object({
  username: z.string().min(3),
  name: z.string().min(3).max(40),
  role: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.coerce.number().min(10).optional(),
  bio: z.string().min(15).max(300).optional(),
  dateOfBirth: z.preprocess(
    (arg) =>
      typeof arg === "string" || arg instanceof Date
        ? new Date(arg)
        : undefined,
    z.date().optional()
  ),
  image: z.string().optional(),
});

export const UpdateUserSchema = userSchema.partial();

export const userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});