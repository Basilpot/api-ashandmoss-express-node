import { z } from "zod";

enum postType {
  blog = "blog",
  travel_guide = "travel_guide",
}

export const CreateBlogValidator = z.object({
  title: z
    .string()
    .min(5, { message: "Title must be at least of 5 characters." }),
  slug: z.string({ message: "Slug is required." }),
  content: z.string(),
  coverImage: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  tags: z.string().optional(),
  authorId: z.number().int().optional(),
  published: z.boolean().optional().default(false),
  inTrash: z.boolean().optional().default(false),
  postType: z.enum(postType).default(postType.blog),
});

export const UpdateBlogValidator = CreateBlogValidator.partial();
