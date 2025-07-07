import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { makeDirIfNotExists } from "../utils/helpers.js";

const defaultParams = {
  max_resolution: "12000000",
  quality: "medium",
  return_format: "webp",
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROCESSED_IMAGES_DIR = path.join(process.cwd(), "processedImages");

if (!fs.existsSync(PROCESSED_IMAGES_DIR)) {
  fs.mkdirSync(PROCESSED_IMAGES_DIR, { recursive: true });
}

const removeBackground = async (imagePath) => {
  try {
    const form = new FormData();
    form.append("file", fs.createReadStream(imagePath));

    Object.keys(defaultParams).forEach((key) => {
      form.append(key, defaultParams[key]);
    });

    const authHeader = {
      Authorization: `Token ${process.env.BACKGROUND_CUT_API_KEY}`,
    };

    const response = await axios.post(
      process.env.BACKGROUND_CUT_API_ENDPOINT,
      form,
      {
        headers: { ...form.getHeaders(), ...authHeader },
        timeout: 20000,
      }
    );

    if (response.status >= 200 && response.status < 300) {
      const outputImageUrl = response.data.output_image_url;
      const outputPath = await downloadProcessedImage(
        outputImageUrl,
        imagePath
      );
      return path.normalize(outputPath);
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
  const outputFilename = `${timestamp}-${
    path.parse(filename).name
  }_bg_removed.png`;

  // Use path.join() for filesystem operations
  // const outputPath = path.join(PROCESSED_IMAGES_DIR, outputFilename);
  const outputPath = path.join(
    PROCESSED_IMAGES_DIR,
    `${timestamp}-${filename}_bg_removed.png`
  );

  const response = await axios.get(imageUrl, { responseType: "arraybuffer" });

  // const compressedImage = await sharp(response.data)
  //   .png({
  //     quality: 1, // Adjust quality (0-100)
  //     compressionLevel: 9, // Maximum compression
  //     adaptiveFiltering: true, // Use adaptive filtering
  //   })
  //   .toBuffer();
  await fs.promises.writeFile(outputPath, response.data);

  // return path.normalize(outputPath);
  return `${process.env.BASE_URL}/processedImages/${outputFilename}`;
};

export { removeBackground };
