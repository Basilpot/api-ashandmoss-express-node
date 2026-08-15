import express from "express";
import prisma from "@/lib/prisma";
import { EnvConfig } from "@config/env.config";
import { buildFields, validatetxn } from "@/lib/connectips";
import { sendEmail } from "@/utils/email";
import { orderConfirmedEmailTemplate } from "@/utils/orderConfirmedEmailTemplate";

export async function returnFromGateway(
  req: express.Request,
  res: express.Response,
) {
  try {
    const txnId = String(req.query.TXNID ?? "");

    if (!txnId) {
      return res.redirect(302, EnvConfig.CONNECTIPS_FAILURE_URL!);
    }

    const byTxn = await prisma.payment.findFirst({
      where: { transactionId: txnId },
    });

    const order = byTxn
      ? await prisma.order.findUnique({
          where: { id: byTxn.orderId },
          include: { payment: true, items: true },
        })
      : await prisma.order.findUnique({
          where: { orderNumber: txnId },
          include: { payment: true, items: true },
        });

    if (!order || !order.payment) {
      return res.redirect(
        302,
        `${EnvConfig.CONNECTIPS_FAILURE_URL!}?orderNumber=${encodeURIComponent(txnId)}`,
      );
    }

    const result = await validatetxn(
      buildFields(order.orderNumber, Math.round(Number(order.payment.amount) * 100)),
    );
    const success = result?.status === "SUCCESS";

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: order.payment!.id },
        data: {
          status: success ? "SUCCESS" : "FAILED",
          transactionId: order!.orderNumber,
        },
      });
      await tx.order.update({
        where: { id: order!.id },
        data: { status: success ? "CONFIRMED" : "FAILED" },
      });
    });

    // ponytail: FAILED orders keep their items for admin review; restock happens only when the admin moves them to CANCELLED
    if (success) {
      void sendEmail({
        to: order.email,
        subject: `Order Confirmed — ${order.orderNumber}`,
        text: orderConfirmedEmailTemplate({
          name: order.name,
          email: order.email,
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount.toString(),
          currency: order.currency,
          items: order.items.map((i) => ({
            productName: i.productName,
            variantName: i.variantName,
            quantity: i.quantity,
          })),
        }),
      });
    }

    const url = success
      ? EnvConfig.CONNECTIPS_SUCCESS_URL!
      : EnvConfig.CONNECTIPS_FAILURE_URL!;

    return res.redirect(
      302,
      `${url}?orderNumber=${encodeURIComponent(order.orderNumber)}`,
    );
  } catch {
    return res.redirect(302, EnvConfig.CONNECTIPS_FAILURE_URL!);
  }
}
