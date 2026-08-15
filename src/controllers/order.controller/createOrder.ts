import express from "express";
import prisma from "@/lib/prisma";
import { buildLoginForm } from "@/lib/connectips";
import { CreateOrderValidation } from "@/validations/order/order.validation";

type OrderItemInput = {
  productId: number;
  productName: string;
  variantId: number | null;
  variantName: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export async function createOrder(
  req: express.Request,
  res: express.Response,
) {
  try {
    const parsed = CreateOrderValidation.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid order details",
        error: parsed.error,
      });
    }

    const { items, name, email, phone, address, city, note } = parsed.data;
    const isAdmin = Boolean(req.user);

    // ponytail: full Date.now() + 4 digits = 21 chars > connectIPS TXNID limit (20); slice keeps it unique
    const orderNumber = `ORD-${Date.now().toString().slice(-10)}${Math.floor(1000 + Math.random() * 9000)}`;

    const order = await prisma.$transaction(async (tx) => {
      const orderItems: OrderItemInput[] = [];
      let total = 0;

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: { variants: true },
        });

        if (!product || (product.status !== "PUBLISHED" && !isAdmin)) {
          throw new Error("PRODUCT_NOT_FOUND");
        }

        let unitPrice: number;
        let variantId: number | null = null;
        let variantName: string | null = null;

        if (item.variantId) {
          const variant = product.variants.find((v) => v.id === item.variantId);
          if (!variant) {
            throw new Error("VARIANT_NOT_FOUND");
          }
          if (variant.stock < item.quantity) {
            throw new Error("OUT_OF_STOCK");
          }
          const decremented = await tx.variant.updateMany({
            where: { id: variant.id, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });
          if (decremented.count === 0) {
            throw new Error("OUT_OF_STOCK");
          }
          unitPrice = Number(variant.price);
          variantId = variant.id;
          variantName = variant.name;
        } else if (product.price != null) {
          unitPrice = Number(product.price);
        } else if (product.variants.length > 0) {
          unitPrice = Math.min(...product.variants.map((v) => Number(v.price)));
        } else {
          throw new Error("PRODUCT_NO_PRICE");
        }

        const lineTotal = Math.round(unitPrice * item.quantity * 100) / 100;
        total += lineTotal;
        orderItems.push({
          productId: product.id,
          productName: product.title,
          variantId,
          variantName,
          quantity: item.quantity,
          unitPrice,
          lineTotal,
        });
      }

      // ponytail: variant-less products have no stock field to decrement — stock handling skipped for them
      const totalAmount = Math.round(total * 100) / 100;

      return tx.order.create({
        data: {
          orderNumber,
          name,
          email,
          phone,
          address: address ?? null,
          city: city ?? null,
          note: note ?? null,
          totalAmount,
          items: { create: orderItems },
          payment: {
            create: { amount: totalAmount, status: "PENDING", provider: "CONNECTIPS" },
          },
        },
        include: { items: true, payment: true },
      });
    });

    const paymentForm = buildLoginForm(order.orderNumber, Math.round(Number(order.totalAmount) * 100));

    return res.status(201).json({
      message: "Order created successfully",
      data: { order, paymentForm },
    });
  } catch (error: any) {
    const errors: Record<string, [number, string]> = {
      PRODUCT_NOT_FOUND: [404, "Product not found"],
      VARIANT_NOT_FOUND: [400, "Variant not found"],
      OUT_OF_STOCK: [409, "Not enough stock available"],
      PRODUCT_NO_PRICE: [400, "Product has no price"],
    };
    const mapped = errors[error?.message];
    if (mapped) {
      return res.status(mapped[0]).json({ message: mapped[1] });
    }
    return res.status(500).json({
      message: "Failed to create order",
    });
  }
}
