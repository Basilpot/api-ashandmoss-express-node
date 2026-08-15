import { z } from "zod";

export const CreateInfoPageValidator = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  coverImage: z.string().optional().or(z.literal("")),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  published: z.boolean().optional().default(true),
  infoPageCategoryId: z.string().optional(),
});

export const UpdateInfoPageValidator = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().optional(),
  content: z.string().min(1).optional(),
  coverImage: z.string().optional().or(z.literal("")),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  published: z.boolean().optional(),
  infoPageCategoryId: z.string().optional(),
});
