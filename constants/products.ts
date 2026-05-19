export type ProductSku = {
  id: string;
  name: string;
  accentColor: string;
  accentBg: string;
  category: 'csd' | 'kinley';
  /** Product line code, e.g. KO, FX, SP, or KW for water */
  line: string;
};

const CSD_LINES = [
  { code: 'KO', accentColor: '#dc2626', accentBg: '#fef2f2' },
  { code: 'FX', accentColor: '#ea580c', accentBg: '#fff7ed' },
  { code: 'SP', accentColor: '#16a34a', accentBg: '#f0fdf4' },
] as const;

const CSD_SIZES = ['300ML', '500ML', '1.25L'] as const;

const KINLEY_SIZES = ['200ML', '500ML', '1L'] as const;

const KINLEY_STYLE = {
  accentColor: '#0369a1',
  accentBg: '#e0f2fe',
};

function slug(line: string, size: string): string {
  return `${line}-${size}`.toLowerCase().replace(/\./g, '').replace(/\s+/g, '-');
}

function buildCsdSkus(): ProductSku[] {
  const skus: ProductSku[] = [];
  for (const line of CSD_LINES) {
    for (const size of CSD_SIZES) {
      skus.push({
        id: slug(line.code, size),
        name: `${line.code} ${size}`,
        accentColor: line.accentColor,
        accentBg: line.accentBg,
        category: 'csd',
        line: line.code,
      });
    }
  }
  return skus;
}

function buildKinleySkus(): ProductSku[] {
  return KINLEY_SIZES.map((size) => ({
    id: slug('KW', size),
    name: `Kinley Water ${size}`,
    accentColor: KINLEY_STYLE.accentColor,
    accentBg: KINLEY_STYLE.accentBg,
    category: 'kinley',
    line: 'KW',
  }));
}

export const CSD_SKUS: ProductSku[] = buildCsdSkus();

export const KINLEY_WATER_SKUS: ProductSku[] = buildKinleySkus();

export const ALL_PRODUCT_SKUS: ProductSku[] = [...CSD_SKUS, ...KINLEY_WATER_SKUS];

/** CSD SKUs grouped by product line for section headers in the form. */
export const CSD_SKU_GROUPS = CSD_LINES.map((line) => ({
  line: line.code,
  accentColor: line.accentColor,
  skus: CSD_SKUS.filter((s) => s.line === line.code),
}));
