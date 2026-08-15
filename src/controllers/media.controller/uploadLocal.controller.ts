import express from "express";
import { saveLocalFile } from "@/images/local-upload";

export async function uploadLocal(
  req: express.Request,
  res: express.Response
) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const result = await saveLocalFile(
      req.file as Express.Multer.File,
      "media",
    );
    if (!result.success) {
      return res.status(500).json({ error: "Failed to save file", details: result.error });
    }

    return res.status(201).json({ url: result.url, filename: result.filename, path: result.path });
  } catch (error) {
    console.error("Local upload error:", error);
    return res.status(500).json({ error: "Upload failed" });
  }
}
