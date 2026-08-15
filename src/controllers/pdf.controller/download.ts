import { Request, Response } from "express";
import PDFDocument from "pdfkit";
import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

type OrderWithItems = Prisma.OrderGetPayload<{ include: { items: true } }>;

async function getStoreName(): Promise<string> {
  const setting = await prisma.storeSetting.findUnique({ where: { id: 1 } });
  const name = (setting?.siteConfig as any)?.name;
  return typeof name === "string" && name ? name : "Store";
}

export async function generateInvoicePdf(order: OrderWithItems): Promise<Buffer> {
  const storeName = await getStoreName();
  const regular = "Times-Roman";
  const bold = "Times-Bold";
  const cur = order.currency || "NPR";

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 60, size: "A4" });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.font(bold).fontSize(22).text(storeName, { align: "center" });
    doc.moveDown(0.3);
    doc.font(regular).fontSize(11).text(`Invoice ${order.orderNumber}`, { align: "center" });
    doc.fontSize(10).text(`Date: ${order.createdAt.toLocaleDateString("en-GB")}`, { align: "center" });
    doc.moveDown(1.5);

    doc.font(bold).fontSize(13).text("Bill To");
    doc.moveDown(0.3);
    doc.font(regular).fontSize(11);
    doc.text(order.name);
    doc.text(order.email);
    if (order.phone) doc.text(order.phone);
    if (order.address) doc.text(order.address);
    if (order.city) doc.text(order.city);
    doc.moveDown(1);

    const cols = { product: 60, qty: 350, unit: 410, total: 475 };

    const headerY = doc.y;
    doc.font(bold).fontSize(11);
    doc.text("Item", cols.product, headerY);
    doc.text("Qty", cols.qty, headerY);
    doc.text("Unit Price", cols.unit, headerY);
    doc.text("Line Total", cols.total, headerY);
    doc.moveDown(0.4);
    doc.moveTo(60, doc.y).lineTo(535, doc.y).stroke();
    doc.moveDown(0.6);

    doc.font(regular).fontSize(11);
    for (const item of order.items) {
      const y = doc.y;
      if (y > 740) {
        doc.addPage();
        doc.moveDown(0.6);
      }
      const rowY = doc.y;
      doc.text(item.productName + (item.variantName ? ` (${item.variantName})` : ""), cols.product, rowY);
      doc.text(String(item.quantity), cols.qty, rowY);
      doc.text(`${cur} ${Number(item.unitPrice).toFixed(2)}`, cols.unit, rowY);
      doc.text(`${cur} ${Number(item.lineTotal).toFixed(2)}`, cols.total, rowY);
      doc.moveDown(0.6);
    }

    doc.moveDown(1.5);
    doc.font(bold).fontSize(12).text(`Total: ${cur} ${Number(order.totalAmount).toFixed(2)}`, { align: "right" });

    doc.end();
  });
}

export async function downloadOrderPdf(req: Request, res: Response) {
  try {
    const orderId = Number(req.query.orderId);
    if (!orderId) {
      return res.status(400).json({ message: "orderId is required" });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const buffer = await generateInvoicePdf(order);
    const filename = `invoice-${order.orderNumber}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.send(buffer);
  } catch {
    return res.status(500).json({ message: "Failed to generate invoice" });
  }
}
