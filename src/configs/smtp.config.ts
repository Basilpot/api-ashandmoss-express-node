import nodemailer from "nodemailer";
import { EnvConfig } from "./env.config";

// Full SMTP via env (webmail). SMTP_* are required — no Gmail fallback.
const options = {
  host: EnvConfig.SMTP_HOST!,
  port: EnvConfig.SMTP_PORT || 465,
  secure: EnvConfig.SMTP_SECURE !== false,
  auth: {
    user: EnvConfig.SMTP_USER!,
    pass: EnvConfig.SMTP_PASS!,
  },
};

const transporter = nodemailer.createTransport(options);
export type sendEmailOptions = {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  displayName?: string;
  attachments?: { filename: string; content: Buffer | string; contentType?: string }[];
};

export async function sendEmail({
  from,
  to,
  subject,
  text,
  html,
  displayName,
  attachments,
}: sendEmailOptions) {
  const info = await transporter.sendMail({
    from: `${displayName ?? EnvConfig.EMAIL_DISPLAY_NAME} <${from}>`,
    to: to,
    subject: subject,
    text: text,
    html: html,
    attachments: attachments,
  });

  return {
    message: "Email sent successfully",
    id: info.messageId,
  };
}
