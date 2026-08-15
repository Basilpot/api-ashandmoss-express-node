import express from "express";
import { NextFunction } from "express";
import {
  addAdmin,
  adminLogin,
  getDashboardStats,
  getMe,
  updateMe,
} from "@/controllers/admin.controller";
import { adminMiddleware } from "@/middlewares/admin.middleware";
import messages from "@/constants/messages.constant";

export const adminRouter:express.Router = express.Router();

const requireSuperAdmin = (req: any, res: any, next: NextFunction) => {
  if (req.user?.role !== "SUPERADMIN") {
    return res.status(403).json({ message: messages.unAuthorized });
  }
  next();
};

/**
 * @openapi
 * /api/v1/admin/login:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Admin login
 *     responses:
 *       200:
 *         description: login successful
 */
adminRouter.post("/login", adminLogin);

/**
 * @openapi
 * /api/v1/admin/add:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Add new admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: admin created
 */
adminRouter.post("/add", adminMiddleware, requireSuperAdmin, addAdmin);

/**
 * @openapi
 * /api/v1/admin/analytics:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get dashboard statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: dashboard stats
 */
adminRouter.get("/analytics", adminMiddleware, getDashboardStats);
adminRouter.get("/me", adminMiddleware, getMe);
adminRouter.patch("/me", adminMiddleware, updateMe);
