import express from "express";
import { upload } from "../configs/multer.config";
import { adminMiddleware } from "@/middlewares/admin.middleware";
import { uploadLocal, uploadLocalMultiple } from "../controllers/media.controller";

export const mediaRouter: express.Router = express.Router();

const multipleImageUploadMiddleware = upload.array("images");

/**
 * @openapi
 * /api/v1/media/local:
 *   post:
 *     tags:
 *       - Media
 *     summary: Upload single file locally
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: file uploaded
 */
mediaRouter.post("/local", adminMiddleware, upload.single("file"), uploadLocal);

/**
 * @openapi
 * /api/v1/media/local/multiple:
 *   post:
 *     tags:
 *       - Media
 *     summary: Upload multiple files locally
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: files uploaded
 */
mediaRouter.post(
	"/local/multiple",
	adminMiddleware,
	multipleImageUploadMiddleware,
	uploadLocalMultiple
);
