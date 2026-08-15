import { Request, Response } from "express";
import messages from "@/constants/messages.constant";
import prisma from "@/lib/prisma";
import { productDetailSelect } from "./productSelect";

export async function getProductById(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(404).json({ message: messages.dataNotFound });
  }

  const product = await prisma.product.findUnique({
    where: { id },
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
