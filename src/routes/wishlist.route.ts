import express from "express";
import { AddRemoveFromWishlist, checkWishlist, getUserWishlist } from "../controllers/wishlist.controller";
import { userAuthMiddleware } from "../middlewares/userAuth.middleware";

export const wishlistRouter: express.Router = express.Router();

/**
 * @openapi
 * /api/v1/wishlist:
 *   get:
 *     tags:
 *       - Wishlist
 *     security:
 *       - bearerAuth: []
 *     summary: Get current user's wishlist
 *     responses:
 *       200:
 *         description: list
 */
wishlistRouter.get("/", userAuthMiddleware, getUserWishlist)

/**
 * @openapi
 * /api/v1/wishlist/{id}:
 *   put:
 *     tags:
 *       - Wishlist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     summary: Add or remove item from wishlist
 *     responses:
 *       200:
 *         description: updated
 */
wishlistRouter.put('/:id', userAuthMiddleware, AddRemoveFromWishlist)

/**
 * @openapi
 * /api/v1/wishlist/check/{id}:
 *   get:
 *     tags:
 *       - Wishlist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     summary: Check if item is in wishlist
 *     responses:
 *       200:
 *         description: presence
 */
wishlistRouter.get("/check/:id", userAuthMiddleware, checkWishlist)