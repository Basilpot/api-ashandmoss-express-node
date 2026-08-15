import express from "express";
import prisma from "@/lib/prisma";

export const checkWishlist = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const userId = req.user.id;
    const itemId = Number(req.params.id);

    if (!itemId) {
      return res.status(400).json({ message: "Invalid item id" });
    }

    const existing = await prisma.wishlist.findFirst({
      where: {
        userId,
        itemId,
      },
    });

    return res.json({
      inWishlist: !!existing,
    });
  } catch (err) {
    console.error("Wishlist check error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
