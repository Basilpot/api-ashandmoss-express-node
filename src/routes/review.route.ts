import {
  createReview,
  deleteReview,
  getAllReviews,
  getReviewByProductId,
} from "@/controllers/review.controller";
import { userAuthMiddleware } from "@/middlewares/userAuth.middleware";
import express from "express";

export const reviewRouter: express.Router = express.Router();

/**
 * @openapi
 * /api/v1/review:
 *   get:
 *     tags:
 *       - Review
 *     summary: Get all reviews
 *     responses:
 *       200:
 *         description: list
 */
reviewRouter.get("/", getAllReviews);

/**
 * @openapi
 * /api/v1/review/{productId}:
 *   get:
 *     tags:
 *       - Review
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: reviews for product
 */
reviewRouter.get("/:productId", getReviewByProductId);

/**
 * @openapi
 * /api/v1/review:
 *   post:
 *     tags:
 *       - Review
 *     summary: Create a review
 *     responses:
 *       201:
 *         description: created
 */
reviewRouter.post("/", userAuthMiddleware, createReview);

/**
 * @openapi
 * /api/v1/review/{id}:
 *   delete:
 *     tags:
 *       - Review
 *     security:
 *       - bearerAuth: []
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
reviewRouter.delete("/:id", userAuthMiddleware, deleteReview);
