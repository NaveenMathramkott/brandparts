export default {
  backgroundCutApi: {
    endpoint:
      process.env.BACKGROUND_CUT_API_ENDPOINT ||
      "https://backgroundcut.co/api/v1/cut/",
    token: process.env.BACKGROUND_CUT_API_KEY,
    timeout: process.env.API_TIMEOUT || 20000,
    defaultParams: {
      max_resolution: "12000000",
      quality: "medium",
      return_format: "webp",
    },
  },
  upload: {
    maxFiles: 5,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
  },
  storage: {
    outputDir: process.env.OUTPUT_DIR || "processedImages",
  },
  mongo: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017/image_processor",
  },
  googleSheets: {
    spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
    sheetName: process.env.GOOGLE_SHEETS_SHEET_NAME || "brandpartsReports",
    keyFilePath: process.env.GOOGLE_SHEETS_KEY_FILE_PATH,
  },
};
