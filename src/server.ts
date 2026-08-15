import express from "express";
import path from "node:path";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorHandler } from "@/middlewares/errorHandler.middleware";
import { EnvConfig } from "@config/env.config";
import { limiter } from "@/utils/rateLimit.util";
import { v1Router } from "@/routes/v1/index.route";
import { corsOptions } from "@/configs/cors.config";
// import helmet from "helmet";
import morgan from "morgan";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import openapi from "./docs/openapi";

const app = express();
app.set("trust proxy", 1);
app.use(cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
// app.use(helmet());
app.use(morgan("tiny"));
// start cron
// initPopularityCron();

console.log("RUNNING ON NODE ENV: ", EnvConfig.NODE_ENV);
app.use(cookieParser());

// Generate OpenAPI spec from JSDoc comments in controllers/routes
const swaggerOptions = {
  definition: {
    ...openapi,
    servers: [
      {
        url: `http://localhost:${EnvConfig.PORT || 3000}`,
        description: "Local",
      },
    ],
  },
  apis: ["./src/routes/**/*.ts"],
};
const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Serve OpenAPI JSON and Swagger UI
app.get("/api-docs.json", (_req, res) => res.json(swaggerSpec));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(limiter);

app.use("/api/v1", v1Router);

// Serve locally uploaded images from public/uploads
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "public", "uploads")),
);

app.use(errorHandler);

app.listen(EnvConfig.PORT, () => {
  console.log(`Server is running on port ${EnvConfig.PORT}`);
});
