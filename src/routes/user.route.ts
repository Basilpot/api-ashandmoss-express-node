import express from "express";
import {
  deleteUser,
  getAllUsers,
  getByUsername,
  getUserDetails,
  registerUser,
  updateUser,
  userLogin,
} from "@/controllers/user.controller";
import { logout } from "@/controllers/auth.controller/logout";
import { adminMiddleware } from "@/middlewares/admin.middleware";
import { userAuthMiddleware } from "@/middlewares/userAuth.middleware";

export const userRouter: express.Router = express.Router();

/**
 * @openapi
 * /api/v1/users:
 *   get:
 *     tags:
 *       - User
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: users list
 */
userRouter.get("/", adminMiddleware, getAllUsers);

/**
 * @openapi
 * /api/v1/users/me:
 *   get:
 *     tags:
 *       - User
 *     summary: Get own user details
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: user details
 */
userRouter.get("/me", userAuthMiddleware, getUserDetails);

/**
 * @openapi
 * /api/v1/users/me:
 *   patch:
 *     tags:
 *       - User
 *     summary: Update own user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: updated
 */
userRouter.patch("/me", userAuthMiddleware, updateUser);

/**
 * @openapi
 * /api/v1/users/login:
 *   post:
 *     tags:
 *       - User
 *     summary: User login
 *     responses:
 *       200:
 *         description: token
 */
userRouter.post("/login", userLogin);

/**
 * @openapi
 * /api/v1/users/register:
 *   post:
 *     tags:
 *       - User
 *     summary: Register user
 *     responses:
 *       201:
 *         description: created
 */
userRouter.post("/register", registerUser);

/**
 * @openapi
 * /api/v1/users/logout:
 *   post:
 *     tags:
 *       - User
 *     summary: Logout user
 *     responses:
 *       200:
 *         description: logged out
 */
userRouter.post("/logout", logout);

/**
 * @openapi
 * /api/v1/users/{username}:
 *   get:
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: user
 */
userRouter.get("/:username", getByUsername);

/**
 * @openapi
 * /api/v1/users/{id}:
 *   delete:
 *     tags:
 *       - User
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
userRouter.delete("/:id", userAuthMiddleware, deleteUser);
