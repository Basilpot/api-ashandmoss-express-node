import { createPrivateKey, sign as rsaSign } from "node:crypto";
import { EnvConfig } from "@/configs/env.config";

const FIELD_NAMES = [
  "TXNID",
  "TXNDATE",
  "TXNAMT",
  "CRN",
  "RU",
  "PFU",
  "PR1",
] as const;

// ponytail: CONNECTIPS_PRIVATE_KEY is the PEM export of the NCHL CREDITOR.pfx
// (see README for the one-time openssl command to extract it)
function getPrivateKey() {
  if (!EnvConfig.CONNECTIPS_PRIVATE_KEY) {
    throw new Error("CONNECTIPS_PRIVATE_KEY is not configured");
  }
  return createPrivateKey(EnvConfig.CONNECTIPS_PRIVATE_KEY);
}

function todayDDMMYYYY(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
}

function buildToken(values: Record<string, string>): string {
  const raw = `${FIELD_NAMES.map((n) => `${n}=${values[n]}`).join(",")},TOKEN=TOKEN`;
  const signature = rsaSign("sha256", Buffer.from(raw), getPrivateKey());
  return signature.toString("base64");
}

export function buildFields(orderNumber: string, amountPaisa: number): Array<{ name: string; value: string }> {
  const values: Record<string, string> = {
    TXNID: orderNumber,
    TXNDATE: todayDDMMYYYY(),
    TXNAMT: String(Math.round(amountPaisa)),
    CRN: "NPR",
    RU: EnvConfig.CONNECTIPS_SUCCESS_URL!,
    PFU: EnvConfig.CONNECTIPS_FAILURE_URL!,
    PR1: EnvConfig.CONNECTIPS_MERCHANT_ID!,
  };

  return [
    ...FIELD_NAMES.map((n) => ({ name: n, value: values[n]! })),
    { name: "TOKEN", value: buildToken(values) },
  ];
}

export function buildLoginForm(orderNumber: string, amountPaisa: number) {
  return {
    actionUrl: `${EnvConfig.CONNECTIPS_BASE_URL}/login`,
    fields: buildFields(orderNumber, amountPaisa),
  };
}

export async function validatetxn(fields: Array<{ name: string; value: string }>): Promise<any> {
  try {
    const body = new URLSearchParams(fields.map((f) => [f.name, f.value]));
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(`${EnvConfig.CONNECTIPS_BASE_URL}/validatetxn`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${EnvConfig.CONNECTIPS_APP_ID}:${EnvConfig.CONNECTIPS_APP_PASSWORD}`,
          ).toString("base64")}`,
        },
        body,
        signal: controller.signal,
      });
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  } catch {
    return { status: "ERROR" };
  }
}
