import { z } from "zod";

export const CreateAuthorValidator = z.object({
  username: z.string().optional(),
  name: z.string().optional(),
  email: z.email(),
  password: z.string().min(8).max(32),
  bio: z.string().max(300).optional(),
  image: z.string().optional(),
});

export const UpdateAuthorValidator = CreateAuthorValidator.partial();
