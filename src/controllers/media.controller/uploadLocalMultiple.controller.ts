import express from "express";
import path from "node:path";
import { saveLocalFile } from "@/images/local-upload";

export async function uploadLocalMultiple(
  req: express.Request,
  res: express.Response
) {
  try {
    const files = req.files as Express.Multer.File[] | undefined;
    const dir = req.query.dir;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const subdir =
      typeof dir === "string" && dir.trim().length > 0
        ? dir
            .split("/")
            .map((s) => s.trim())
            .filter((s) => s && s !== "." && s !== "..")
            .map((s) => s.replace(/[^a-z0-9-_]/gi, ""))
            .filter(Boolean)
            .join("/")
        : "";
    const target = subdir
      ? path.join("media", subdir)
      : "media";

    const results = await Promise.all(
      files.map(async (f) => {
        return await saveLocalFile(f, target);
      })
    );

    // Normalize response to { result: [ { url, filename, path } ] }
    const formatted = results.map((r) => ({ url: r.url, filename: r.filename, path: r.path }));

    return res.status(200).json({ result: formatted });
  } catch (error) {
    console.error("Local multiple upload error:", error);
    return res.status(500).json({ error: "Upload failed" });
  }
}
