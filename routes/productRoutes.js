import express from "express";
import { uploadImagesToDatabase } from "../controllers/imageController.js";

const router = express.Router();
router.post("/uploadImages", uploadImagesToDatabase);

export default router;

// Using azure blob intead of local file upload
// const upload = multer({ dest: "uploads/" });
// router.post("/", createProduct);
// router.post("/processRemoveBackground", upload.single("image"), async (req, res, next) => {
//   try {
//     await processImages(req, res);
//   } catch (err) {
//     next(err);
//   }
// });
// router.get("/processedImages", getAllProcessedImages);
// router.get("/processedImages/:filename", getProcessedImage);
