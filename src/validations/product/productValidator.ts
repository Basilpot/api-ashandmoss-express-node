import z from "zod";

export const productVariantSchema = z.object({
  name: z.string().min(1, "Variant name is required"),
  sku: z.string().nullable().optional(),
  price: z.number().nonnegative("Variant price must be non-negative"),
  compareAtPrice: z.number().nullable().optional(),
  stock: z.number().int().nonnegative().default(0).optional(),
  image: z.string().nullable().optional(),
  sortOrder: z.number().int().default(0).optional(),
});

export const createProductSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  description: z.string().nullable().optional(),
  price: z.number().nonnegative().nullable().optional(),
  maxPrice: z.number().nonnegative().nullable().optional(),
  compareAtPrice: z.number().nonnegative().nullable().optional(),
  videoIntro: z.string().nullable().optional(),
  images: z.array(z.string()).default([]).optional(),
  attributes: z
    .array(z.object({ name: z.string(), value: z.string() }))
    .nullable()
    .optional(),
  faq: z.any().nullable().optional(),
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  metaKeywords: z.string().nullable().optional(),
  metaRobots: z.string().nullable().optional(),
  sku: z.string().nullable().optional(),
  priceCurrency: z.string().max(3, "Currency must be a 3-letter code").nullable().optional(),
  availability: z
    .enum(["InStock", "OutOfStock", "PreOrder", "BackOrder"])
    .nullable()
    .optional(),
  isFeatured: z.boolean().default(false).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT").optional(),
  categoryId: z.string().nullable().optional(),
  brandId: z.number().int().nullable().optional(),
  tagIds: z.array(z.string()).default([]).optional(),
  variants: z.array(productVariantSchema).default([]).optional(),
});

export const updateProductSchema = createProductSchema.partial();
