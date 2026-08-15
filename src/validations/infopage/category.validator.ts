import { z } from "zod";

export const CreateInfoPageCategoryValidator = z.object({
  categoryHandle: z
    .string()
    .min(1, "Category handle is required")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Handle must be lowercase and hyphen-separated",
    ),
  categoryName: z.string().optional(),
});

export const UpdateInfoPageCategoryValidator = z.object({
  categoryHandle: z
    .string()
    .min(1)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Handle must be lowercase and hyphen-separated",
    )
    .optional(),
  categoryName: z.string().optional(),
});
