import express from "express";
import { sendEmail } from "@/configs/smtp.config";
import { EnvConfig } from "@/configs/env.config";
import prisma from "@/lib/prisma";

// Public contact/inquiry relay. Mail is routed to the store's configured
// contact address (StoreSetting.siteConfig.email) and sent from the platform
// address, regardless of what the request body says — the visitor's own
// contact info stays in the body text.
export async function sendEmailToClient(
  req: express.Request,
  res: express.Response,
) {
  const { subject, text, html, attachments } = req.body;

  const setting = await prisma.storeSetting.findFirst();
  const siteConfig = (setting?.siteConfig as any) ?? {};
  const to = siteConfig?.email || EnvConfig.EMAIL_FROM;
  const displayName = siteConfig?.name || EnvConfig.EMAIL_DISPLAY_NAME;

  if (!to) {
    return res.status(400).json({ message: "Store contact email is required" });
  }

  try {
    const response = await sendEmail({
      from: EnvConfig.EMAIL_FROM || "noreply@ashandmoss.com",
      to,
      subject,
      text,
      html,
      attachments,
      displayName,
    });
    return res.status(200).json({
      data: response,
    });
  } catch {
    console.error("Error sending email:");
    return res.status(500).json({
      message: "Failed to send email",
    });
  }
}
