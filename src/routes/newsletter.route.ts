import express from "express";
import {
  listNewsletter,
  sendNewsletterEmail,
  subscribeNewsletter,
  toggleSubscriber,
  unsubscribeNewsletter,
} from "../controllers/newsletter.controller";
import { adminMiddleware } from "@/middlewares/admin.middleware";

export const newsletterRouter: express.Router = express.Router();

/**
 * @openapi
 * /api/v1/newsletter/subscribe:
 *   post:
 *     tags:
 *       - Newsletter
 *     summary: Subscribe to newsletter
 *     responses:
 *       200:
 *         description: subscribed
 */
newsletterRouter.get("/", adminMiddleware, listNewsletter);
newsletterRouter.post("/subscribe", subscribeNewsletter);

/**
 * @openapi
 * /api/v1/newsletter/unsubscribe:
 *   get:
 *     tags:
 *       - Newsletter
 *     summary: Unsubscribe from newsletter
 *     responses:
 *       200:
 *         description: unsubscribed
 */
newsletterRouter.get("/unsubscribe", unsubscribeNewsletter);

/**
 * @openapi
 * /api/v1/newsletter/send-email:
 *   post:
 *     tags:
 *       - Newsletter
 *     summary: Send newsletter email
 *     responses:
 *       200:
 *         description: sent
 */
newsletterRouter.post("/send-email", adminMiddleware, sendNewsletterEmail);
newsletterRouter.patch("/:id/toggle", adminMiddleware, toggleSubscriber);
