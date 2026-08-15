import express from "express";
import { upload } from "../configs/multer.config";
import { adminMiddleware } from "../middlewares/admin.middleware";
import {
  uploadMedia,
  uploadMediaMultiple,
  listMedia,
  createMedia,
  getMedia,
  updateMedia,
  deleteMedia,
  batchMedia,
} from "../controllers/media-library.controller";

export const mediaLibraryRouter: express.Router = express.Router();

const singleUpload = upload.single("file");
const multipleUpload = upload.array("images");

mediaLibraryRouter.post("/upload", adminMiddleware, singleUpload, uploadMedia);
mediaLibraryRouter.post("/upload/multiple", adminMiddleware, multipleUpload, uploadMediaMultiple);
mediaLibraryRouter.get("/", listMedia);
mediaLibraryRouter.post("/", adminMiddleware, createMedia);
mediaLibraryRouter.post("/batch", adminMiddleware, batchMedia);
mediaLibraryRouter.get("/:id", getMedia);
mediaLibraryRouter.patch("/:id", adminMiddleware, updateMedia);
mediaLibraryRouter.delete("/:id", adminMiddleware, deleteMedia);
