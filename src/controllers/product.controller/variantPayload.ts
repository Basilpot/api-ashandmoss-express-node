import { Prisma } from "@prisma/client";

export const variantCreate = (v: {
  name: string;
  sku?: string | null | undefined;
  price: number;
  compareAtPrice?: number | null | undefined;
  stock?: number | undefined;
  image?: string | null | undefined;
  sortOrder?: number | undefined;
}) => ({
  name: v.name,
  sku: v.sku ?? null,
  price: new Prisma.Decimal(v.price),
  compareAtPrice: v.compareAtPrice != null ? new Prisma.Decimal(v.compareAtPrice) : null,
  stock: v.stock ?? 0,
  image: v.image ?? null,
  sortOrder: v.sortOrder ?? 0,
});
