import express from "express";
import {
  getAllProcessedImages,
  getProcessedImage,
  removeBackgroundFromImage,
} from "../controllers/imageController.js";
import { createProduct } from "../controllers/productController.js";
import { upload } from "../utils/fileUpload.js";

const router = express.Router();
router.post("/", createProduct);

router.post("/processImages", (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return next(err);
    }
    await removeBackgroundFromImage(req, res, next);
  });
});

router.get("/processedImages", getAllProcessedImages);
router.get("/processedImages/:filename", getProcessedImage);

export default router;
