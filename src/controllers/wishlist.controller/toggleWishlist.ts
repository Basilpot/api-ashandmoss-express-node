import prisma from "@/lib/prisma";
import express from "express";

export async function AddRemoveFromWishlist(
  req: express.Request,
  res: express.Response
) {
  const productId = req.params.id;
  const userId = req.user.id;

  if (!productId) {
    return res.status(404).json({
      message: "Item is required to add to wishlist.",
    });
  }

  const itemExistInWishlist = await prisma.wishlist.findFirst({
    where: {
      userId,
      itemId: Number(productId),
    },
  });

  if (itemExistInWishlist) {
    await prisma.wishlist.delete({
      where: { id: itemExistInWishlist.id },
    });

    return res.status(200).json({
      message: "Item removed from wishlist",
    });
  }

  await prisma.wishlist.create({
    data: {
      userId,
      itemId: Number(productId),
    },
  });

  return res.status(200).json({
    message: "Wishlist updated",
  });
}
