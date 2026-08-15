import { EnvConfig } from "@/configs/env.config";
import { sendEmail as sendEmailSMTP } from "@/configs/smtp.config";

// ponytail: Gmail SMTP via nodemailer. Kept the {to, subject, text} signature so all callers pass HTML through unchanged.
export async function sendEmail({
  to,
  subject,
  text,
  displayName,
}: {
  to: string;
  subject: string;
  text: string;
  displayName?: string;
}) {
  return sendEmailSMTP({
    from: EnvConfig.EMAIL_FROM || "noreply@ashandmoss.com",
    to,
    subject,
    text: text.replace(/<[^>]*>/g, " "),
    html: text,
    ...(displayName ? { displayName } : {}),
  });
}
