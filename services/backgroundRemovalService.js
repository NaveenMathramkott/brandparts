import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import config from "../config/api.js";
import { makeDirIfNotExists } from "../utils/helpers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROCESSED_IMAGES_DIR = path.join(process.cwd(), "processedImages");

const removeBackground = async (imagePath) => {
  try {
    const form = new FormData();
    form.append("file", fs.createReadStream(imagePath));

    Object.keys(config.backgroundCutApi.defaultParams).forEach((key) => {
      form.append(key, config.backgroundCutApi.defaultParams[key]);
    });

    const authHeader = {
      Authorization: `Token ${process.env.BACKGROUND_CUT_API_KEY}`,
    };

    const response = await axios.post(config.backgroundCutApi.endpoint, form, {
      headers: { ...form.getHeaders(), ...authHeader },
      timeout: config.backgroundCutApi.timeout,
    });

    if (response.status >= 200 && response.status < 300) {
      const outputImageUrl = response.data.output_image_url;
      const outputPath = await downloadProcessedImage(
        outputImageUrl,
        imagePath
      );
      return outputPath;
    } else {
      throw new Error(`API Error: Status Code ${response.status}`);
    }
  } catch (error) {
    console.error("Background removal failed:", error.message);
    throw error;
  }
};

const downloadProcessedImage = async (imageUrl, originalPath) => {
  // Create the processed_images directory if it doesn't exist
  await makeDirIfNotExists(PROCESSED_IMAGES_DIR);

  const filename = path.basename(originalPath);
  const timestamp = Date.now();
  const outputPath = path.join(
    PROCESSED_IMAGES_DIR,
    `${timestamp}-${filename}_bg_removed.webp`
  );

  const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
  await fs.promises.writeFile(outputPath, response.data);

  return outputPath;
};

export { removeBackground };
