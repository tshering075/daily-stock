import { calculateSecondarySale, type ProductStock } from '@/lib/sheets';

export type FifoLotFields = {
  mfgDate: string;
  batchNo: string;
  bbdDate: string;
  openingStock: string;
  primarySale: string;
  physicalStock: string;
};

export type FifoLotResolved = {
  fifoLotNo: number;
  mfgDate: string;
  batchNo: string;
  bbdDate: string;
  openingStock: number;
  primarySale: number;
  physicalStock: number;
  secondarySale: number;
};

export type SkuDetailSubmission = {
  productSku: string;
  fifoLotNo: number;
  mfgDate: string;
  batchNo: string;
  bbdDate: string;
  openingStock: number;
  primarySale: number;
  physicalStock: number;
  secondarySale: number;
};

export type SkuLotsState = Record<string, FifoLotFields[]>;

export function createEmptyLot(): FifoLotFields {
  return {
    mfgDate: '',
    batchNo: '',
    bbdDate: '',
    openingStock: '',
    primarySale: '',
    physicalStock: '',
  };
}

export function createInitialSkuLots(skuIds: string[]): SkuLotsState {
  return Object.fromEntries(skuIds.map((id) => [id, [createEmptyLot()]]));
}

/** MFG / batch / BBD from a previous sheet submission (stock fields not included). */
export type SkuPrefillLot = {
  productSku: string;
  fifoLotNo: number;
  mfgDate: string;
  batchNo: string;
  bbdDate: string;
};

/** Pre-fill lot metadata; opening / primary / physical stay blank for today's entry. */
export function buildSkuLotsFromPrefill(
  skuCatalog: { id: string; name: string }[],
  prefill: SkuPrefillLot[]
): SkuLotsState {
  const state = createInitialSkuLots(skuCatalog.map((s) => s.id));

  for (const sku of skuCatalog) {
    const lots = prefill
      .filter((p) => p.productSku === sku.name)
      .sort((a, b) => a.fifoLotNo - b.fifoLotNo)
      .map((p) => ({
        mfgDate: p.mfgDate || '',
        batchNo: p.batchNo || '',
        bbdDate: p.bbdDate || '',
        openingStock: '',
        primarySale: '',
        physicalStock: '',
      }));

    if (lots.length > 0) {
      state[sku.id] = lots;
    }
  }

  return state;
}

function parseNumber(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const num = Number(trimmed);
  if (!Number.isFinite(num) || num < 0) return null;
  return num;
}

function isLotEmpty(lot: FifoLotFields): boolean {
  return (
    !lot.mfgDate.trim() &&
    !lot.batchNo.trim() &&
    !lot.bbdDate.trim() &&
    !lot.openingStock.trim() &&
    !lot.primarySale.trim() &&
    !lot.physicalStock.trim()
  );
}

function resolveLot(
  lot: FifoLotFields,
  fifoLotNo: number
): { ok: true; data: FifoLotResolved | null } | { ok: false; reason: 'partial' | 'dates' } {
  if (isLotEmpty(lot)) {
    return { ok: true, data: null };
  }

  const opening = parseNumber(lot.openingStock);
  const primary = parseNumber(lot.primarySale);
  const physical = parseNumber(lot.physicalStock);

  if (!lot.mfgDate.trim() || !lot.batchNo.trim() || !lot.bbdDate.trim()) {
    return { ok: false, reason: 'dates' };
  }

  if (opening === null || primary === null || physical === null) {
    return { ok: false, reason: 'partial' };
  }

  return {
    ok: true,
    data: {
      fifoLotNo,
      mfgDate: lot.mfgDate.trim(),
      batchNo: lot.batchNo.trim(),
      bbdDate: lot.bbdDate.trim(),
      openingStock: opening,
      primarySale: primary,
      physicalStock: physical,
      secondarySale: calculateSecondarySale(opening, primary, physical),
    },
  };
}

export type SkuSubtotal = {
  opening: number;
  secondary: number;
  physical: number;
};

export function computeSkuSubtotal(lots: FifoLotResolved[]): SkuSubtotal {
  return lots.reduce(
    (acc, lot) => {
      if (isLotResolvedEmpty(lot)) return acc;
      return {
        opening: acc.opening + lot.openingStock,
        secondary: acc.secondary + lot.secondarySale,
        physical: acc.physical + lot.physicalStock,
      };
    },
    { opening: 0, secondary: 0, physical: 0 }
  );
}

function isLotResolvedEmpty(lot: FifoLotResolved): boolean {
  return (
    !lot.mfgDate &&
    !lot.batchNo &&
    lot.openingStock === 0 &&
    lot.primarySale === 0 &&
    lot.physicalStock === 0
  );
}

export function resolveSkuLots(
  skuId: string,
  skuName: string,
  lots: FifoLotFields[]
):
  | {
      ok: true;
      rows: SkuDetailSubmission[];
      subtotal: SkuSubtotal;
      skipped: boolean;
    }
  | { ok: false; message: string } {
  const activeLots: FifoLotResolved[] = [];

  for (let i = 0; i < lots.length; i++) {
    const result = resolveLot(lots[i], i + 1);
    if (!result.ok) {
      if (result.reason === 'dates') {
        return {
          ok: false,
          message: `${skuName} lot ${i + 1}: enter MFG date, batch no., and BBD date.`,
        };
      }
      return {
        ok: false,
        message: `${skuName} lot ${i + 1}: fill opening, primary, and physical stock, or clear the row.`,
      };
    }
    if (result.data) {
      activeLots.push(result.data);
    }
  }

  if (activeLots.length === 0) {
    return { ok: true, rows: [], subtotal: { opening: 0, secondary: 0, physical: 0 }, skipped: true };
  }

  const rows: SkuDetailSubmission[] = activeLots.map((lot) => ({
    productSku: skuName,
    fifoLotNo: lot.fifoLotNo,
    mfgDate: lot.mfgDate,
    batchNo: lot.batchNo,
    bbdDate: lot.bbdDate,
    openingStock: lot.openingStock,
    primarySale: lot.primarySale,
    physicalStock: lot.physicalStock,
    secondarySale: lot.secondarySale,
  }));

  return {
    ok: true,
    rows,
    subtotal: computeSkuSubtotal(activeLots),
    skipped: false,
  };
}

export function aggregateCsdFromSkuDetails(rows: SkuDetailSubmission[]): ProductStock {
  return rows.reduce(
    (acc, row) => ({
      openingStock: acc.openingStock + row.openingStock,
      primarySale: acc.primarySale + row.primarySale,
      physicalStock: acc.physicalStock + row.physicalStock,
      secondarySale: acc.secondarySale + row.secondarySale,
    }),
    { openingStock: 0, primarySale: 0, physicalStock: 0, secondarySale: 0 }
  );
}

export function resolveSkuCatalogLots(
  skuLots: SkuLotsState,
  skuCatalog: { id: string; name: string }[]
):
  | {
      ok: true;
      skuDetails: SkuDetailSubmission[];
      aggregate: ProductStock;
      hasData: boolean;
    }
  | { ok: false; message: string } {
  const allRows: SkuDetailSubmission[] = [];

  for (const sku of skuCatalog) {
    const lots = skuLots[sku.id] ?? [createEmptyLot()];
    const result = resolveSkuLots(sku.id, sku.name, lots);
    if (!result.ok) return result;
    allRows.push(...result.rows);
  }

  return {
    ok: true,
    skuDetails: allRows,
    aggregate: aggregateCsdFromSkuDetails(allRows),
    hasData: allRows.length > 0,
  };
}
