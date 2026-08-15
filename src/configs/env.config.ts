import dotenv from "dotenv";
dotenv.config();

export const EnvConfig = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  JWT_SECRET: process.env.JWT_SECRET!,
  EMAIL_UNSUB_SECRET: process.env.EMAIL_UNSUB_SECRET!,
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY!,

  VERIFICATION_TOKEN: process.env.VERIFICATION_TOKEN,
  VERIFICATION_LINK: process.env.VERIFICATION_LINK,
  RESET_LINK: process.env.RESET_LINK,
  FRONTEND_BASE_URL: process.env.FRONTEND_BASE_URL,
  BASE_URL: process.env.BASE_URL,

  COOKIE_AGE:
    Number(process.env.COOKIE_AGE) || ((7 * 24 * 60 * 60 * 1000) as number),
  JWT_EXPIRY:
    Number(process.env.JWT_EXPIRY) || ((7 * 24 * 60 * 60 * 1000) as number),
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
  DOMAIN: process.env.DOMAIN,

  // Optional separate base URL for uploaded files (useful in production)
  UPLOADS_BASE_URL: process.env.UPLOADS_BASE_URL,

  EMAIL_DISPLAY_NAME:
    process.env.EMAIL_DISPLAY_NAME || "Website Form Submission",
  EMAIL_FROM: process.env.EMAIL_FROM,

  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: Number(process.env.SMTP_PORT) || undefined,
  SMTP_SECURE:
    process.env.SMTP_SECURE === undefined
      ? undefined
      : process.env.SMTP_SECURE === "true",
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,

  // NCHL connectIPS (sandbox: uat.connectips.com, prod: login.connectips.com)
  CONNECTIPS_BASE_URL:
    process.env.CONNECTIPS_BASE_URL || "https://uat.connectips.com",
  CONNECTIPS_MERCHANT_ID: process.env.CONNECTIPS_MERCHANT_ID!,
  CONNECTIPS_APP_ID: process.env.CONNECTIPS_APP_ID!,
  CONNECTIPS_APP_NAME: process.env.CONNECTIPS_APP_NAME!,
  CONNECTIPS_APP_PASSWORD: process.env.CONNECTIPS_APP_PASSWORD!,
  CONNECTIPS_PRIVATE_KEY: process.env.CONNECTIPS_PRIVATE_KEY!,
  CONNECTIPS_SUCCESS_URL: process.env.CONNECTIPS_SUCCESS_URL!,
  CONNECTIPS_FAILURE_URL: process.env.CONNECTIPS_FAILURE_URL!,
};
