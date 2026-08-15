import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { EnvConfig } from "@/configs/env.config";

const ALGO = "aes-256-gcm";
const IV_LEN = 12;
const KEY = Buffer.from(EnvConfig.ENCRYPTION_KEY ?? "", "hex");

if (KEY.length !== 32) {
  throw new Error("ENCRYPTION_KEY must be a 64-character hex string (32 bytes)");
}

// Secrets are encrypted at rest (AES-256-GCM) so they can be decrypted when
// used, unlike a one-way hash. Format: enc.<iv>.<authTag>.<ciphertext>
export function encryptSecret(plain: string): string {
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return [
    "enc",
    iv.toString("base64"),
    cipher.getAuthTag().toString("base64"),
    encrypted.toString("base64"),
  ].join(".");
}

export function decryptSecret(stored: string): string {
  const [tag, ivB64, authB64, dataB64] = stored.split(".");
  if (tag !== "enc" || !ivB64 || !authB64 || !dataB64) {
    throw new Error("Invalid encrypted value");
  }
  const decipher = createDecipheriv(ALGO, KEY, Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(authB64, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]).toString("utf8");
}
