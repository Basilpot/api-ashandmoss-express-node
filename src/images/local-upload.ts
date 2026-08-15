import fs from "node:fs/promises";
import path from "node:path";
import { EnvConfig } from "@/configs/env.config";

export async function saveLocalFile(file: Express.Multer.File, dir?: string): Promise<{
  success: boolean;
  url?: string;
  fullUrl?: string;
  path?: string;
  filename?: string;
  error?: any;
}> {
  try {
    let uploadsDir;
    if (dir) {
      uploadsDir = path.join(process.cwd(), "public", "uploads", dir);
    } else {
      uploadsDir = path.join(process.cwd(), "public", "uploads");
    }

    await fs.mkdir(uploadsDir, { recursive: true });

    const ext = path.extname(file.originalname) || (file.mimetype ? `.${file.mimetype.split("/")[1]}` : ".webp");

    // Preserve sanitized original name and append generated suffix
    const originalBase = path.parse(file.originalname).name || "file";
    const sanitizedBase = originalBase
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-_]/g, "");

    const generated = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const filename = `${sanitizedBase}-${generated}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    await fs.writeFile(filePath, file.buffer);

    // Prefer a dedicated uploads base URL when provided (production .env)
    let baseUrl = (EnvConfig.UPLOADS_BASE_URL || EnvConfig.BASE_URL || "").replace(/\/$/, "");

    // If no base URL provided, default to localhost with API port
    if (!baseUrl) {
      const port = EnvConfig.PORT || 3000;
      baseUrl = `http://localhost:${port}`;
    }

    // If the resolved baseUrl is https but points to localhost or we're in development, use http
    if (/^https:\/\//i.test(baseUrl) && (baseUrl.includes("localhost") || EnvConfig.NODE_ENV === "development")) {
      baseUrl = baseUrl.replace(/^https:\/\//i, "http://");
    }

    const relativeUrl = dir
      ? `/uploads/${dir}/${encodeURIComponent(filename)}`
      : `/uploads/${encodeURIComponent(filename)}`;

    // Optionally construct full URL (only use when explicitly needed)
    let fullUrl = "";
    if (baseUrl) {
      fullUrl = `${baseUrl}${relativeUrl}`;
    }

    return { success: true, url: relativeUrl, fullUrl, path: filePath, filename };
  } catch (error) {
    console.error("saveLocalFile error:", error);
    return { success: false, error };
  }
}
