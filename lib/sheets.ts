import { GOOGLE_SHEETS_URL, isSheetsConfigured } from '@/constants/config';

export type ProductStock = {
  openingStock: number;
  primarySale: number;
  physicalStock: number;
  secondarySale: number;
};

export type StockSubmission = {
  entryType: 'preseller' | 'distributor';
  preseller: string;
  distributor: string;
  region: string;
  csd: ProductStock;
  kinleyWater: ProductStock;
};

export function calculateSecondarySale(
  openingStock: number,
  primarySale: number,
  physicalStock: number
): number {
  return openingStock + primarySale - physicalStock;
}

export async function submitToGoogleSheet(
  data: StockSubmission
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!isSheetsConfigured) {
    return {
      ok: false,
      message:
        'Google Sheet URL is not configured. Add EXPO_PUBLIC_GOOGLE_SHEETS_URL to your .env file.',
    };
  }

  try {
    const response = await fetch(GOOGLE_SHEETS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(data),
    });

    const text = await response.text();
    let parsed: { success?: boolean; error?: string } = {};
    try {
      parsed = JSON.parse(text);
    } catch {
      // Apps Script may return non-JSON on some errors
    }

    if (!response.ok || parsed.success === false) {
      return {
        ok: false,
        message: parsed.error ?? `Server returned ${response.status}. Try again.`,
      };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      message: 'Could not reach Google Sheets. Check your internet connection.',
    };
  }
}
