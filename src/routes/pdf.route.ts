import express from "express";
import { downloadOrderPdf } from "@/controllers/pdf.controller/download";
import { generateAndEmailPDF } from "@/controllers/pdf.controller/generate-and-email";
import { adminMiddleware } from "@/middlewares/admin.middleware";

export const pdfRouter: express.Router = express.Router();

pdfRouter.use(adminMiddleware);

pdfRouter.get("/order", downloadOrderPdf);
pdfRouter.post("/generate-email", generateAndEmailPDF);
