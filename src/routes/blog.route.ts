import express from "express";
import {
  createBlog,
  deleteBlog,
  getAllBlogs,
  getBlogBySlug,
  getPublishedBlogs,
  updateBlog,
  restoreBlog,
  resolveBlog,
  getBlogsByAuthorId,
  getBlogByCategory,
} from "@/controllers/blog.controller";
import { adminMiddleware } from "../middlewares/admin.middleware";
import { redirectMiddleware } from "../middlewares/redirect.middleware";

export const blogRouter: express.Router = express.Router();

/**
 * @openapi
 * /api/v1/blogs:
 *   post:
 *     tags:
 *       - Blog
 *     summary: Create blog
 *     responses:
 *       201:
 *         description: created
 */
blogRouter.post("/", adminMiddleware, createBlog);

/**
 * @openapi
 * /api/v1/blogs/published:
 *   get:
 *     tags:
 *       - Blog
 *     summary: Get published blogs
 *     responses:
 *       200:
 *         description: list
 */
blogRouter.get("/published", redirectMiddleware, getPublishedBlogs);

/**
 * @openapi
 * /api/v1/blogs:
 *   get:
 *     tags:
 *       - Blog
 *     security:
 *       - bearerAuth: []
 *     summary: Get all blogs (admin)
 *     responses:
 *       200:
 *         description: list
 */
blogRouter.get("/", adminMiddleware, getAllBlogs);

/**
 * @openapi
 * /api/v1/blogs/author/{id}:
 *   get:
 *     tags:
 *       - Blog
 *     summary: Get blogs by author ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: list of blogs
 */
blogRouter.get("/author/:id", getBlogsByAuthorId);

/**
 * @openapi
 * /api/v1/blogs/restore/{id}:
 *   patch:
 *     tags:
 *       - Blog
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: restored
 */
blogRouter.patch("/restore/:id", adminMiddleware, restoreBlog);

/**
 * @openapi
 * /api/v1/blogs/update/{slug}:
 *   patch:
 *     tags:
 *       - Blog
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: updated
 */
blogRouter.patch("/update/:slug", adminMiddleware, updateBlog);

/**
 * @openapi
 * /api/v1/blogs/resolve/{slug}:
 *   get:
 *     tags:
 *       - Blog
 *     summary: Resolve blog by slug (get active or draft)
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: blog
 */
blogRouter.get("/resolve/:slug", resolveBlog);

/**
 * @openapi
 * /api/v1/blogs/category/{category}:
 *   get:
 *     tags:
 *       - Blog
 *     summary: Get blogs by category
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: list of blogs
 */
blogRouter.get("/category/:category", getBlogByCategory);
/**
 * @openapi
 * /api/v1/blogs/{slug}:
 *   get:
 *     tags:
 *       - Blog
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: blog
 */
blogRouter.get("/:slug", redirectMiddleware, getBlogBySlug);

/**
 * @openapi
 * /api/v1/blogs/{id}:
 *   delete:
 *     tags:
 *       - Blog
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
blogRouter.delete("/:id", adminMiddleware, deleteBlog);

// get blog by author, create blog by author --> disable if no author available
