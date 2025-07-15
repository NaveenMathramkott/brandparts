import { BlobServiceClient } from "@azure/storage-blob";
import axios from "axios";
import "dotenv/config";

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const sasToken = process.env.AZURE_STORAGE_SAS_TOKEN;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

const blobServiceClients = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net/?${sasToken}`
);
const containerClient = blobServiceClients.getContainerClient(containerName);

const extractMetadata = async (bodyData) => {
  const contentType = bodyData["content-type"];
  // const fileType = contentType.split("/")[1];
  const contentDisposition = bodyData["content-disposition"] || "";
  const caption = bodyData["x-image-caption"] || "No caption provided";
  const matches = /filename="([^"]+)"/i.exec(contentDisposition);
  const fileName = matches?.[1] || `image-${Date.now()}`;
  return { fileName, caption };
};

const downloadImageFromUrl = async (imageUrl) => {
  try {
    console.log("Downloading image from URL:", imageUrl);

    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      validateStatus: (status) => status === 200, // Only accept 200 OK responses
      headers: {
        Accept: "image/*", // Explicitly request image data
      },
    });

    if (!response.data || response.data.length === 0) {
      throw new Error("Received empty image data");
    }

    const contentType =
      response.headers["content-type"] ||
      response.headers["Content-Type"] ||
      "application/octet-stream";

    console.log(
      `Downloaded ${response.data.length} bytes, Content-Type: ${contentType}`
    );

    return {
      data: response.data,
      contentType: contentType,
    };
  } catch (error) {
    console.error("Failed to download image:", {
      url: imageUrl,
      status: error.response?.status,
      headers: error.response?.headers,
      message: error.message,
    });
    throw new Error(`Image download failed: ${error.message}`);
  }
};

// Upload the image (substantial data) as a to Azure Storage Blob as a stream
const uploadImageFromUrl = async (blobName, imageData, contentType) => {
  const blobClient = containerClient.getBlockBlobClient(blobName);
  await blobClient.upload(imageData, imageData.length, {
    blobHTTPHeaders: { blobContentType: contentType },
  });
  return blobClient.url;
};

const uploadImageToAzure = async (req, res) => {
  try {
    // Extract image URLs from request body
    let imageUrls = [];

    // Check if single image URL is provided
    if (req.body["image-url"]) {
      imageUrls.push(req.body["image-url"]);
    }
    // Check if multiple image URLs are provided in an array
    else if (req.body["image-urls"] && Array.isArray(req.body["image-urls"])) {
      imageUrls = req.body["image-urls"].slice(0, 5); // Take maximum 5 images
    } else {
      throw new Error(
        "Either 'image-url' or 'image-urls' array is required in request body"
      );
    }

    // Validate we have between 1-5 images
    if (imageUrls.length === 0 || imageUrls.length > 5) {
      throw new Error("You must provide between 1 to 5 images");
    }

    const results = [];

    // Process each image
    for (const imageUrl of imageUrls) {
      try {
        const { data: imageData, contentType } = await downloadImageFromUrl(
          imageUrl
        );

        // Generate unique filename for each image
        const timestamp = Date.now();
        const fileName = `image-${timestamp}-${Math.floor(
          Math.random() * 1000
        )}`;

        // Upload to Azure Blob Storage
        const uploadedUrl = await uploadImageFromUrl(
          fileName,
          imageData,
          contentType
        );

        results.push({
          fileName,
          uploadedUrl,
          status: "success",
          message: "Image uploaded successfully",
        });
      } catch (error) {
        results.push({
          fileName: `failed-image-${Date.now()}`,
          uploadedUrl: null,
          status: "error",
          message: error.message,
        });
      }
    }

    return {
      totalImages: imageUrls.length,
      uploadedUrls: results.filter((r) => r.status === "success").length,
      failedImages: results.filter((r) => r.status === "error").length,
      results,
    };
  } catch (error) {
    console.error("Error in uploadImageToAzure:", error);
    throw error;
  }
};

export { uploadImageToAzure };
