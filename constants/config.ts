/** Set EXPO_PUBLIC_GOOGLE_SHEETS_URL in .env to your deployed Apps Script web app URL. */
export const GOOGLE_SHEETS_URL =
  process.env.EXPO_PUBLIC_GOOGLE_SHEETS_URL?.trim() ?? '';

export const isSheetsConfigured = GOOGLE_SHEETS_URL.length > 0;
