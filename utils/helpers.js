import fs from "fs/promises";

const makeDirIfNotExists = async (dirPath) => {
  try {
    await fs.access(dirPath);
  } catch (error) {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

const removeFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error(`Error removing file ${filePath}:`, error.message);
  }
};

export { makeDirIfNotExists, removeFile };
