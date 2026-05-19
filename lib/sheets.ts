import { GOOGLE_SHEETS_URL, isSheetsConfigured } from '@/constants/config';
import type { SkuDetailSubmission, SkuPrefillLot } from '@/lib/sku-stock';

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
  skuDetails: SkuDetailSubmission[];
};

export function calculateSecondarySale(
  openingStock: number,
  primarySale: number,
  physicalStock: number
): number {
  return openingStock + primarySale - physicalStock;
}

export async function fetchLastSkuPrefill(
  region: string,
  distributor: string
): Promise<{ ok: true; skuLots: SkuPrefillLot[] } | { ok: false; message: string }> {
  if (!isSheetsConfigured) {
    return { ok: true, skuLots: [] };
  }

  try {
    const url =
      `${GOOGLE_SHEETS_URL}?action=lastSkuLots` +
      `&region=${encodeURIComponent(region)}` +
      `&distributor=${encodeURIComponent(distributor)}`;

    const response = await fetch(url);
    const text = await response.text();
    let parsed: { success?: boolean; error?: string; skuLots?: SkuPrefillLot[] } = {};
    try {
      parsed = JSON.parse(text);
    } catch {
      return { ok: false, message: 'Could not read previous stock data from the sheet.' };
    }

    if (!response.ok || parsed.success === false) {
      return {
        ok: false,
        message: parsed.error ?? `Could not load previous data (${response.status}).`,
      };
    }

    return { ok: true, skuLots: parsed.skuLots ?? [] };
  } catch {
    return { ok: false, message: 'Could not load previous stock data. Check your connection.' };
  }
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
