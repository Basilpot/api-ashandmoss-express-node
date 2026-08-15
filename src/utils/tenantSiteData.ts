import { Request } from "express";
import fs from "fs/promises";
import path from "path";
import prisma from "@/lib/prisma";

export type TenantDataField = "siteConfig" | "menu" | "footer" | "sidebarMenu";

const DEFAULT_FILES: Record<TenantDataField, string> = {
  siteConfig: "siteConfig.json",
  menu: "menu.json",
  footer: "footer.json",
  sidebarMenu: "sidebar-menu.json",
};

export async function readTenantData(
  req: Request,
  field: TenantDataField,
): Promise<any> {
  const setting = await prisma.storeSetting.findFirst();
  const value = setting ? (setting as any)[field] : null;
  if (value != null) return value;

  // ponytail: file fallback = default config for stores that never customized.
  try {
    const file = path.join(process.cwd(), "data", DEFAULT_FILES[field]);
    return JSON.parse(await fs.readFile(file, "utf-8"));
  } catch {
    return { items: [], version: "1.0.0", updatedAt: new Date().toISOString() };
  }
}

export async function writeTenantData(
  req: Request,
  field: TenantDataField,
  value: any,
) {
  await prisma.storeSetting.upsert({
    where: { id: 1 },
    update: { [field]: value },
    create: { id: 1, [field]: value },
  });
}
