import { Request, Response } from "express";
import prisma from "@/lib/prisma";
import messages from "@/constants/messages.constant";

export async function deleteProduct(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(404).json({ message: messages.dataNotFound });
  }

  const product = await prisma.product.findUnique({
    where: { id },
    select: { id: true, title: true, slug: true },
  });

  if (!product) {
    return res.status(404).json({ message: messages.dataNotFound });
  }

  // ponytail: OrderItem.product has no cascade; block deletion instead of a 500 FK crash
  const orderCount = await prisma.orderItem.count({ where: { productId: id } });
  if (orderCount > 0) {
    return res.status(409).json({
      message: `Cannot delete product: ${orderCount} order item(s) reference it`,
    });
  }

  await prisma.product.delete({ where: { id } });

  return res.status(200).json({
    message: messages.dataDeleted,
    product,
  });
}
