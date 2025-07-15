import axios from "axios";
import FormData from "form-data";
import fs from "fs";

const defaultParams = {
  max_resolution: "12000000",
  quality: "medium",
  return_format: "webp",
};

// const compressedImage = await sharp(response.data)
// .resize(800)
// .png({
//   quality: 80, // Adjust quality (0-100)
//   compressionLevel: 9, // Maximum compression
//   adaptiveFiltering: true, // Use adaptive filtering
// })
// .toBuffer();

const removeBackground = async (imagePath) => {
  try {
    const form = new FormData();
    form.append("file", fs.createReadStream(imagePath));

    Object.keys(defaultParams).forEach((key) => {
      form.append(key, defaultParams[key]);
    });

    const authHeader = {
      Authorization: `${process.env.BACKGROUND_CUT_API_KEY}`,
    };
    console.log("formadta--", form);

    const response = await axios.post(
      process.env.BACKGROUND_CUT_API_ENDPOINT,
      form,
      {
        headers: { ...form.getHeaders(), ...authHeader },
        timeout: 20000,
      }
    );
    console.log("response--", response);

    if (response.status >= 200 && response.status < 300) {
      const outputImageUrl = response.data.output_image_url;

      // return path.normalize(outputPath);
      return outputImageUrl;
    } else {
      throw new Error(`API Error: Status Code ${response.status}`);
    }
  } catch (error) {
    console.error("Background removal failed:", error.message);
    throw error;
  }
};

export { removeBackground };
