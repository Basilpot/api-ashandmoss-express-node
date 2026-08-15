import { z } from "zod";

export const OrderStatusEnum = z.enum([
  "PENDING_PAYMENT",
  "CONFIRMED",
  "CANCELLED",
  "FAILED",
  "COMPLETED",
]);

export const CreateOrderValidation = z.object({
  items: z
    .array(
      z.object({
        productId: z.coerce.number(),
        variantId: z.coerce.number().optional(),
        quantity: z.coerce.number().int().min(1),
      }),
    )
    .min(1),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  address: z.string().optional(),
  city: z.string().optional(),
  note: z.string().optional(),
});

export const UpdateOrderStatusValidation = z.object({
  status: OrderStatusEnum,
});
