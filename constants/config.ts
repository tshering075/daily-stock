/** Apps Script web app URL (POST) — set EXPO_PUBLIC_GOOGLE_SHEETS_URL in .env */
export const GOOGLE_SHEETS_URL =
  process.env.EXPO_PUBLIC_GOOGLE_SHEETS_URL?.trim() ?? '';

/** Browser link to open the spreadsheet — set EXPO_PUBLIC_GOOGLE_SHEET_VIEW_URL in .env */
export const GOOGLE_SHEET_VIEW_URL =
  process.env.EXPO_PUBLIC_GOOGLE_SHEET_VIEW_URL?.trim() ?? '';

export const isSheetsConfigured = GOOGLE_SHEETS_URL.length > 0;
export const isSheetViewConfigured = GOOGLE_SHEET_VIEW_URL.length > 0;
