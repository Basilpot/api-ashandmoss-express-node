import express from "express";
import { sendEmailToClient } from "@/controllers/email.controller";

export const emailRouter: express.Router = express.Router();

/**
 * @openapi
 * /api/v1/email/send:
 *   post:
 *     tags:
 *       - Email
 *     summary: Send email to the store's contact address (public contact relay)
 *     responses:
 *       200:
 *         description: email sent
 */
emailRouter.post("/send", sendEmailToClient);
