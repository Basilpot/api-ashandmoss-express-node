import express from "express";
import path from "node:path";
import {
  userRouter,
  adminRouter,
  reviewRouter,
  blogRouter,
  authorRouter,
  mediaRouter,
  emailRouter,
  mediaLibraryRouter,
  productRouter,
  categoryRouter,
  brandRouter,
  tagRouter,
  variantRouter,
  orderRoute,
  paymentRoute,
  pdfRouter,
  menuRouter,
  pageRouter,
  redirectRouter,
  siteConfigRouter,
  sidebarMenuRouter,
  testimonialRouter,
  footerRouter,
  infoPageRouter,
  newsletterRouter,
  wishlistRouter,
} from "@/routes/index.route";
import {
  forgetPassword,
  logout,
  resetPassword,
  verifyEmail,
} from "@/controllers/auth.controller";

export const v1Router: express.Router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: v1
 *     description: Version 1 API routes
 */

v1Router.use("/users", userRouter);
v1Router.use("/admin", adminRouter);
v1Router.use("/products", productRouter);
v1Router.use("/categories", categoryRouter);
v1Router.use("/brands", brandRouter);
v1Router.use("/tags", tagRouter);
v1Router.use("/variants", variantRouter);
v1Router.use("/orders", orderRoute);
v1Router.use("/payments", paymentRoute);
v1Router.use("/reviews", reviewRouter);
v1Router.use("/authors", authorRouter);
v1Router.use("/blogs", blogRouter);
v1Router.use("/uploads", mediaRouter);
v1Router.use("/media-library", mediaLibraryRouter);
v1Router.use("/menus", menuRouter);
v1Router.use("/pages", pageRouter);
v1Router.use("/redirects", redirectRouter);
v1Router.use("/site-config", siteConfigRouter);
v1Router.use("/sidebar-menu", sidebarMenuRouter);
v1Router.use("/testimonials", testimonialRouter);
v1Router.use("/footers", footerRouter);
v1Router.use("/info-page", infoPageRouter);
v1Router.use("/newsletter", newsletterRouter);
v1Router.use("/wishlist", wishlistRouter);
v1Router.use("/email", emailRouter);
v1Router.use("/pdf", pdfRouter);
v1Router.use("/logout", logout);

// Serve locally uploaded files under /api/v1/uploads
v1Router.use(
  "/uploads",
  express.static(path.join(process.cwd(), "public", "uploads"), {
    setHeaders: (res) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  }),
);

// verify email
v1Router.get("/verify/:token", verifyEmail);
//forget password
v1Router.post("/forget-password", forgetPassword);
// reset password
v1Router.post("/reset-password/:token", resetPassword);

//health check
v1Router.get("/health", (_req, res) => {
  return res.status(200).json({
    site: process.env.DOMAIN,
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});
