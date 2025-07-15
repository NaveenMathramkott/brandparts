import Image from "../models/Image.js";
import { addGoogleSheet } from "../services/googleSheetsService.js";
import { uploadImageToAzure } from "../utils/fileUpload.js";

//only for testing
const createGoogleSheets = async (filename, url) => {
  try {
    await addGoogleSheet("Sheet1", [null, filename, url, 1000]);
  } catch (error) {
    console.log("error--", error);
  }
};

// Store the metadata in MongoDB
const storeMetadata = async (name, imageUrls) => {
  const imageDoc = new Image({
    name: name,
    description: "hello world",
    urls: imageUrls,
  });
  await imageDoc.save();
};

const uploadImagesToDatabase = async (req, res) => {
  try {
    const response = await uploadImageToAzure(req, res);
    const { totalImages, results } = response;
    await storeMetadata(totalImages, results);
    for (const item of results) {
      try {
        await createGoogleSheets(item.fileName, item.uploadedUrl);
      } catch (error) {
        console.error(
          `Failed to create Google Sheet for ${item.fileName}:`,
          error
        );
        // Continue with other items even if one fails
      }
    }
    res.writeHead(201);
    res.end(
      JSON.stringify({
        message: "Image uploaded and metadata stored successfully",
      })
    );
  } catch (error) {
    throw error;
  }
};

export { uploadImagesToDatabase };

// const processImages = async (req, res) => {
//   console.log("requested image paths", req.file);

//   try {
//     let filesToProcess = [];

//     if (req.file) {
//       // Single file upload
//       filesToProcess.push(req.file);
//     } else if (req.files && req.files.length > 0) {
//       // Multiple files upload
//       filesToProcess = req.files;
//     } else {
//       throw new Error("No images uploaded");
//     }

//     const processedImages = [];

//     // Process images in parallel
//     const processingPromises = filesToProcess.map(async (file) => {
//       try {
//         const processedPath = await removeBackground(file.path);
//         console.log("file path", processedPath);

//         // const imageDoc = new Image({
//         //   originalName: file.originalname,
//         //   originalPath: file.path,
//         //   processedPath,
//         //   metadata: {
//         //     size: file.size,
//         //     mimetype: file.mimetype,
//         //   },
//         // });

//         // await imageDoc.save();

//         // Add to Google Sheets
//         // await addGoogleSheet("Sheet1", [
//         //   new Date().toISOString(),
//         //   file.originalname,
//         //   processedPath,
//         //   file.size,
//         // ]);

//         processedImages.push({
//           originalName: file.originalname,
//           processedPath: path.basename(processedPath),
//         });

//         // Clean up original file
//       } catch (error) {
//         console.error(`Error processing ${file.originalname}:`, error.message);
//         // Clean up in case of error
//         throw error;
//       }
//     });

//     await Promise.all(processingPromises);

//     res.json({
//       success: true,
//       message: `${req.files.length} images processed successfully`,
//       data: processedImages,
//     });
//   } catch (error) {
//     console.log("file error--", error);
//   }
// };
