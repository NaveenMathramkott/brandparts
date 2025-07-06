import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import Image from "../models/Image.js";
import { removeBackground } from "../services/backgroundRemovalService.js";
import { appendData } from "../services/googleSheetsService.js";
import { removeFile } from "../utils/helpers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const processImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw new Error("No images uploaded");
    }

    const processedImages = [];

    // Process images in parallel
    const processingPromises = req.files.map(async (file) => {
      try {
        const processedPath = await removeBackground(file.path);

        const imageDoc = new Image({
          originalName: file.originalname,
          originalPath: file.path,
          processedPath,
          metadata: {
            size: file.size,
            mimetype: file.mimetype,
          },
        });

        await imageDoc.save();

        // Add to Google Sheets
        await appendData("processedImages", [
          new Date().toISOString(),
          file.originalname,
          processedPath,
          file.size,
        ]);

        processedImages.push({
          originalName: file.originalname,
          processedPath: path.basename(processedPath),
        });

        // Clean up original file
        await removeFile(file.path);
      } catch (error) {
        console.error(`Error processing ${file.originalname}:`, error.message);
        // Clean up in case of error
        await removeFile(file.path);
        throw error;
      }
    });

    await Promise.all(processingPromises);

    res.json({
      success: true,
      message: `${req.files.length} images processed successfully`,
      data: processedImages,
    });
  } catch (error) {
    console.log("file error--", error);

    next(error);
  }
};

const removeBackgroundFromImage = async (req, res) => {
  console.log("calsss--", req.files[0]);
  const processingPromises = req.files.map(async (file) => {
    try {
      const processedPath = await removeBackground(file.path);
      console.log("resolved--", processedPath);
      res.json({
        success: true,
        message: `${req.files.length} images processed successfully`,
        data: processedPath,
      });

      // Clean up original file
    } catch (error) {
      console.error(`Error processing ${file.originalname}:`, error.message);
      // Clean up in case of error
      throw error;
    }
  });
};

const getProcessedImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const imagePath = path.join(__dirname, "../processedImages", filename);
    console.log("filename---", filename);
    console.log("image path---", imagePath);

    // Check if file exists
    try {
      await fs.access(imagePath);
    } catch (error) {
      console.log("error--", error);

      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    // Send the image file
    res.sendFile(imagePath);
  } catch (error) {
    // console.error("Error fetching image:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all images
const getAllProcessedImages = async (req, res) => {
  try {
    const dirPath = path.join(__dirname, "../processedImages");
    const files = await fs.readdir(dirPath);

    // Filter only image files (optional)
    const imageFiles = files.filter((file) => {
      return {
        filename: file,
        url: `/processed-images/${file}`, // URL to fetch individual image
      };
    });

    res.json({
      success: true,
      count: imageFiles.length,
      images: imageFiles,
    });
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.json({
        success: true,
        count: 0,
        images: [],
      });
    }
    console.log("error--", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve images",
    });
  }
};

export {
  getAllProcessedImages,
  getProcessedImage,
  processImages,
  removeBackgroundFromImage,
};
