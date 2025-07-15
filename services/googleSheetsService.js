import { google } from "googleapis";

const addGoogleSheet = async (sheetName, data) => {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: process.env.GOOGLE_TYPE,
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: process.env.GOOGLE_AUTH_URI,
        token_uri: process.env.GOOGLE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_CERT_URL,
        client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    // Define headers
    const headers = [
      "Timestamp",
      "Filename",
      "Image URL",
      "File Size",
      "Status",
    ];

    // Check if sheet exists
    let sheetExists = true;
    try {
      await sheets.spreadsheets.get({
        spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
        ranges: [`${sheetName}!A1`],
      });
    } catch (error) {
      if (error.code === 404) {
        sheetExists = false;
      } else {
        throw error;
      }
    }

    if (!sheetExists) {
      // Create new sheet with formatted headers
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
        resource: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetName,
                },
              },
            },
            // Format header row (bold + borders)
            {
              repeatCell: {
                range: {
                  sheetId: 0, // Will be replaced with actual sheetId
                  startRowIndex: 0,
                  endRowIndex: 1,
                  startColumnIndex: 0,
                  endColumnIndex: headers.length,
                },
                cell: {
                  userEnteredFormat: {
                    textFormat: { bold: true },
                    backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 }, // Light gray
                    borders: {
                      top: { style: "SOLID", width: 1 },
                      bottom: { style: "SOLID", width: 1 },
                      left: { style: "SOLID", width: 1 },
                      right: { style: "SOLID", width: 1 },
                    },
                  },
                },
                fields: "userEnteredFormat(textFormat,backgroundColor,borders)",
              },
            },
          ],
        },
      });

      // Add headers to the new sheet
      await sheets.spreadsheets.values.update({
        spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
        range: `${sheetName}!A1`,
        valueInputOption: "USER_ENTERED",
        resource: { values: [headers] },
      });
    } else {
      // Format existing headers (if needed)
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
        resource: {
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId: await getSheetId(sheets, sheetName),
                  startRowIndex: 0,
                  endRowIndex: 1,
                  startColumnIndex: 0,
                  endColumnIndex: headers.length,
                },
                cell: {
                  userEnteredFormat: {
                    textFormat: { bold: true },
                    backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 },
                    borders: {
                      top: { style: "SOLID", width: 1 },
                      bottom: { style: "SOLID", width: 1 },
                      left: { style: "SOLID", width: 1 },
                      right: { style: "SOLID", width: 1 },
                    },
                  },
                },
                fields: "userEnteredFormat(textFormat,backgroundColor,borders)",
              },
            },
          ],
        },
      });
    }

    // Append new data row
    const rowData = [
      new Date().toLocaleString(),
      data[1], // Filename
      data[2], // Image URL
      data[3], // File size
      "Uploaded",
    ];

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: `${sheetName}!A1`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      resource: { values: [rowData] },
    });

    return response.data;
  } catch (error) {
    console.error("Google Sheets operation failed:", error.message);
    throw error;
  }
};

// Helper function to get sheetId by name
async function getSheetId(sheets, sheetName) {
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
  });
  const sheet = spreadsheet.data.sheets.find(
    (s) => s.properties.title === sheetName
  );
  return sheet.properties.sheetId;
}

export { addGoogleSheet };
