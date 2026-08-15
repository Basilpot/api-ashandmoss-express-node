import prisma from "@/lib/prisma";

export async function calculatePrice(productId: number, variantId?: number) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { variants: true },
  });

  if (!product) {
    throw new Error("Product is not available.");
  }

  if (variantId) {
    const variant = product.variants.find((v) => v.id === variantId);
    if (!variant) {
      throw new Error("Variant is not available.");
    }
    return Number(variant.price);
  }

  if (product.price != null) {
    return Number(product.price);
  }

  if (product.variants.length > 0) {
    return Math.min(...product.variants.map((v) => Number(v.price)));
  }

  throw new Error("No price mentioned for this product.");
}
