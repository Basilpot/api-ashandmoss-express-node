import { Request, Response } from "express";
import messages from "@/constants/messages.constant";
import prisma from "@/lib/prisma";
import { productDetailSelect } from "./productSelect";

export async function getProductBySlug(req: Request, res: Response) {
  const { slug } = req.params;

  if (!slug) {
    return res.status(404).json({ message: messages.dataNotFound });
  }

  const product = await prisma.product.findUnique({
    where: { slug },
    select: productDetailSelect,
  });

  if (!product) {
    return res.status(404).json({ message: messages.dataNotFound });
  }

  return res.status(200).json({
    message: messages.dataFetched,
    data: product,
  });
}
