import express from "express";
import {
  authorLogin,
  createAuthor,
  deleteAuthor,
  getAllAuthors,
  getAuthorByUsername,
  updateAuthor,
} from "@/controllers/author.controller";
import { adminMiddleware } from "@/middlewares/admin.middleware";

export const authorRouter: express.Router = express.Router();

/**
 * @openapi
 * /api/v1/author:
 *   get:
 *     tags:
 *       - Author
 *     summary: Get all authors
 *     responses:
 *       200:
 *         description: list of authors
 */
authorRouter.get("/", getAllAuthors);

/**
 * @openapi
 * /api/v1/author/login:
 *   post:
 *     tags:
 *       - Author
 *     summary: Login author
 *     responses:
 *       200:
 *         description: author logged in successfully
 */
authorRouter.post("/login", authorLogin);

/**
 * @openapi
 * /api/v1/author/create:
 *   post:
 *     tags:
 *       - Author
 *     summary: Create an author
 *     responses:
 *       201:
 *         description: author created
 */
authorRouter.post("/create", adminMiddleware, createAuthor);

/**
 * @openapi
 * /api/v1/author/delete/{id}:
 *   delete:
 *     tags:
 *       - Author
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: deleted
 */
/**
 * @openapi
 * /api/v1/author/delete/{id}:
 *   delete:
 *     tags:
 *       - Author
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: deleted
 */
authorRouter.delete("/delete/:id", adminMiddleware, deleteAuthor);

/**
 * @openapi
 * /api/v1/author/update/{id}:
 *   patch:
 *     tags:
 *       - Author
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: updated
 */
/**
 * @openapi
 * /api/v1/author/update/{id}:
 *   patch:
 *     tags:
 *       - Author
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: updated
 */
authorRouter.patch("/update/:username", adminMiddleware, updateAuthor);

/**
 * @openapi
 * /api/v1/author/{id}:
 *   get:
 *     tags:
 *       - Author
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: author
 */
/**
 * @openapi
 * /api/v1/author/{id}:
 *   get:
 *     tags:
 *       - Author
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: author
 */
authorRouter.get("/:username", getAuthorByUsername);
