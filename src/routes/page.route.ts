import express from "express";
import { deletePage } from "@/controllers/page.controller/deletePage";
import { updatePage } from "@/controllers/page.controller/updatePage";
import { createPage } from "@/controllers/page.controller/createPage";
import { getPageById } from "@/controllers/page.controller/getPageById";
import { getPageBySlug } from "@/controllers/page.controller/getPageBySlug";
import { getAllPages } from "@/controllers/page.controller/getAllPages";
import { adminMiddleware } from "@/middlewares/admin.middleware";

export const pageRouter: express.Router = express.Router();

/**
 * @openapi
 * /api/v1/page:
 *   get:
 *     tags:
 *       - Page
 *     summary: Get all pages
 *     responses:
 *       200:
 *         description: list of pages
 */
pageRouter.get("/", getAllPages);

/**
 * @openapi
 * /api/v1/page:
 *   post:
 *     tags:
 *       - Page
 *     summary: Create a new page
 *     responses:
 *       201:
 *         description: page created
 */
pageRouter.post("/", adminMiddleware, createPage);

/**
 * @openapi
 * /api/v1/page/{id}:
 *   patch:
 *     tags:
 *       - Page
 *     summary: Update a page
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: page updated
 */
pageRouter.patch("/:id", adminMiddleware, updatePage);

/**
 * @openapi
 * /api/v1/page/{slug}:
 *   get:
 *     tags:
 *       - Page
 *     summary: Get page by slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: page
 */
pageRouter.get("/:slug", getPageBySlug);

/**
 * @openapi
 * /api/v1/page/{id}:
 *   delete:
 *     tags:
 *       - Page
 *     summary: Delete a page
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: page deleted
 */
pageRouter.delete("/:id", adminMiddleware, deletePage);

/**
 * @openapi
 * /api/v1/page/id/{id}:
 *   get:
 *     tags:
 *       - Page
 *     summary: Get page by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: page
 */
pageRouter.get("/id/:id", getPageById);
