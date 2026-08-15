import express from "express";
import getAllTestimonials from "@/controllers/testimonial.controller/getAllTestimonials";
import createTestimonial from "@/controllers/testimonial.controller/createTestimonial";
import editTestimonial from "@/controllers/testimonial.controller/editTestimonial";
import deleteTestimonial from "@/controllers/testimonial.controller/deleteTestimonial";
import { adminMiddleware } from "@/middlewares/admin.middleware";

const testimonialRouter: express.Router = express.Router();

/**
 * @openapi
 * /api/v1/testimonial:
 *   get:
 *     tags:
 *       - Testimonial
 *     summary: Get all testimonials
 *     responses:
 *       200:
 *         description: list of testimonials
 */
testimonialRouter.get("/", getAllTestimonials);

/**
 * @openapi
 * /api/v1/testimonial:
 *   post:
 *     tags:
 *       - Testimonial
 *     summary: Create a testimonial
 *     responses:
 *       201:
 *         description: testimonial created
 */
testimonialRouter.post("/", adminMiddleware, createTestimonial);

/**
 * @openapi
 * /api/v1/testimonial/{id}:
 *   patch:
 *     tags:
 *       - Testimonial
 *     summary: Update a testimonial
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: testimonial updated
 */
testimonialRouter.patch("/:id", adminMiddleware, editTestimonial);

/**
 * @openapi
 * /api/v1/testimonial/{id}:
 *   delete:
 *     tags:
 *       - Testimonial
 *     summary: Delete a testimonial
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: testimonial deleted
 */
testimonialRouter.delete("/:id", adminMiddleware, deleteTestimonial);

export default testimonialRouter;
