import { Router } from "express";
import {
  createInfoPage,
  getAllInfoPages,
  getInfoPageById,
  getInfoPageBySlug,
  updateInfoPage,
  deleteInfoPage,
} from "@/controllers/infoPage.controller";
import {
  createInfoPageCategory,
  getAllInfoPageCategories,
  getInfoPageCategoryById,
  updateInfoPageCategory,
  deleteInfoPageCategory,
} from "@/controllers/infoPageCategory.controller";
import { adminMiddleware } from "@/middlewares/admin.middleware";

const infoPageRouter: Router = Router();

/**
 * @openapi
 * /api/v1/info-page/categories:
 *   post:
 *     tags:
 *       - Info Page Category
 *     summary: Create info page category
 *     responses:
 *       201:
 *         description: category created
 */
infoPageRouter.post("/categories", adminMiddleware, createInfoPageCategory);

/**
 * @openapi
 * /api/v1/info-page/categories:
 *   get:
 *     tags:
 *       - Info Page Category
 *     summary: Get all info page categories
 *     responses:
 *       200:
 *         description: list of categories
 */
infoPageRouter.get("/categories", getAllInfoPageCategories);

/**
 * @openapi
 * /api/v1/info-page/categories/{id}:
 *   get:
 *     tags:
 *       - Info Page Category
 *     summary: Get info page category by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: category
 */
infoPageRouter.get("/categories/:id", getInfoPageCategoryById);

/**
 * @openapi
 * /api/v1/info-page/categories/{id}:
 *   put:
 *     tags:
 *       - Info Page Category
 *     summary: Update info page category
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: category updated
 */
infoPageRouter.put("/categories/:id", adminMiddleware, updateInfoPageCategory);

/**
 * @openapi
 * /api/v1/info-page/categories/{id}:
 *   delete:
 *     tags:
 *       - Info Page Category
 *     summary: Delete info page category
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: category deleted
 */
infoPageRouter.delete("/categories/:id", adminMiddleware, deleteInfoPageCategory);

/**
 * @openapi
 * /api/v1/info-page:
 *   post:
 *     tags:
 *       - Info Page
 *     summary: Create info page
 *     responses:
 *       201:
 *         description: page created
 */
infoPageRouter.post("/", adminMiddleware, createInfoPage);

/**
 * @openapi
 * /api/v1/info-page:
 *   get:
 *     tags:
 *       - Info Page
 *     summary: Get all info pages
 *     responses:
 *       200:
 *         description: list of pages
 */
infoPageRouter.get("/", getAllInfoPages);

/**
 * @openapi
 * /api/v1/info-page/slug/{slug}:
 *   get:
 *     tags:
 *       - Info Page
 *     summary: Get info page by slug
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
infoPageRouter.get("/slug/:slug", getInfoPageBySlug);

/**
 * @openapi
 * /api/v1/info-page/{id}:
 *   get:
 *     tags:
 *       - Info Page
 *     summary: Get info page by ID
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
infoPageRouter.get("/:id", getInfoPageById);

/**
 * @openapi
 * /api/v1/info-page/{id}:
 *   put:
 *     tags:
 *       - Info Page
 *     summary: Update info page
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
infoPageRouter.put("/:id", adminMiddleware, updateInfoPage);

/**
 * @openapi
 * /api/v1/info-page/{id}:
 *   delete:
 *     tags:
 *       - Info Page
 *     summary: Delete info page
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
infoPageRouter.delete("/:id", adminMiddleware, deleteInfoPage);

export default infoPageRouter;
