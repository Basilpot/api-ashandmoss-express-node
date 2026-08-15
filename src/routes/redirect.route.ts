import express from "express";
import { getAllRedirects } from "@/controllers/redirect.controller/getAllRedirects";
import { createRedirect } from "@/controllers/redirect.controller/createRedirect";
import { deleteRedirect } from "@/controllers/redirect.controller/deleteRedirect";
import { adminMiddleware } from "@/middlewares/admin.middleware";

export const redirectRouter: express.Router = express.Router();

/**
 * @openapi
 * /api/v1/redirect:
 *   get:
 *     tags:
 *       - Redirect
 *     summary: Get all redirects
 *     responses:
 *       200:
 *         description: list of redirects
 */
redirectRouter.get("/", getAllRedirects);

/**
 * @openapi
 * /api/v1/redirect:
 *   put:
 *     tags:
 *       - Redirect
 *     summary: Create or update a redirect
 *     responses:
 *       200:
 *         description: redirect created/updated
 */
redirectRouter.put("/", adminMiddleware, createRedirect);

/**
 * @openapi
 * /api/v1/redirect/{id}:
 *   delete:
 *     tags:
 *       - Redirect
 *     summary: Delete a redirect
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: redirect deleted
 */
redirectRouter.delete("/:id", adminMiddleware, deleteRedirect);
