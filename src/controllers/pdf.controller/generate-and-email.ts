import express from "express";
import { generateInvoicePdf } from "@/controllers/pdf.controller/download";
import { sendEmail } from "@/configs/smtp.config";
import prisma from "@/lib/prisma";
import { EnvConfig } from "@config/env.config";

export async function generateAndEmailPDF(
  req: express.Request,
  res: express.Response
) {
  const { orderId, email, subscribe } = req.body;

  if (!orderId) {
    return res.status(400).json({ message: "Missing required field: orderId" });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const pdfBuffer = await generateInvoicePdf(order);
    const to = email || order.email;
    const filename = `invoice-${order.orderNumber}.pdf`;

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#1e3a5f;margin-bottom:8px">Your Invoice ${order.orderNumber}</h2>
        <p style="color:#555;margin-bottom:20px">
          Thank you for your purchase. Please find your invoice attached as a PDF.
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0" />
        <p style="color:#999;font-size:12px">
          Total: ${order.currency} ${Number(order.totalAmount).toFixed(2)}
        </p>
      </div>
    `;

    await sendEmail({
      from: EnvConfig.EMAIL_FROM || "noreply@ashandmoss.com",
      to,
      subject: `Invoice ${order.orderNumber}`,
      text: `Here is your invoice ${order.orderNumber}.`,
      html,
      attachments: [{
        filename,
        content: pdfBuffer,
        contentType: "application/pdf",
      }],
    });

    if (subscribe) {
      prisma.newsletterSubscriber.upsert({
        where: { email: to },
        create: { email: to, unsubSecret: crypto.randomUUID() },
        update: {},
      }).catch(() => {});
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Invoice email error:", err);
    return res.status(500).json({ message: "Failed to send email" });
  }
}
