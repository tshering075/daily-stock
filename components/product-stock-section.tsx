import { useMemo } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { AppTheme } from '@/constants/app-theme';
import { calculateSecondarySale, type ProductStock } from '@/lib/sheets';

export type ProductStockFields = {
  openingStock: string;
  primarySale: string;
  physicalStock: string;
};

type ProductStockSectionProps = {
  title: string;
  accentColor: string;
  accentBg: string;
  values: ProductStockFields;
  onChange: (field: keyof ProductStockFields, value: string) => void;
  editable: boolean;
};

function parseNumber(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const num = Number(trimmed);
  if (!Number.isFinite(num) || num < 0) return null;
  return num;
}

export function ProductStockSection({
  title,
  accentColor,
  accentBg,
  values,
  onChange,
  editable,
}: ProductStockSectionProps) {
  const secondarySale = useMemo(() => {
    const opening = parseNumber(values.openingStock);
    const primary = parseNumber(values.primarySale);
    const physical = parseNumber(values.physicalStock);
    if (opening === null || primary === null || physical === null) return null;
    return calculateSecondarySale(opening, primary, physical);
  }, [values.openingStock, values.primarySale, values.physicalStock]);

  return (
    <View style={[styles.section, { borderColor: accentColor, backgroundColor: accentBg }]}>
      <Text style={[styles.sectionTitle, { color: accentColor }]}>{title}</Text>
      <Text style={styles.optionalHint}>Optional — leave blank if not updating today</Text>

      <StockField
        label="Opening stock"
        value={values.openingStock}
        onChangeText={(v) => onChange('openingStock', v)}
        editable={editable}
      />
      <StockField
        label="Primary sale"
        value={values.primarySale}
        onChangeText={(v) => onChange('primarySale', v)}
        editable={editable}
      />
      <StockField
        label="Physical stock"
        value={values.physicalStock}
        onChangeText={(v) => onChange('physicalStock', v)}
        editable={editable}
      />

      <View style={styles.secondaryBox}>
        <Text style={styles.secondaryLabel}>Secondary sale</Text>
        <Text style={styles.secondaryHint}>(Opening + Primary) − Physical</Text>
        <Text style={[styles.secondaryValue, { color: accentColor }]}>
          {secondarySale !== null ? secondarySale.toLocaleString() : '—'}
        </Text>
      </View>
    </View>
  );
}

export const EMPTY_PRODUCT_STOCK: ProductStock = {
  openingStock: 0,
  primarySale: 0,
  physicalStock: 0,
  secondarySale: 0,
};

export function isEmptyProductStock(fields: ProductStockFields): boolean {
  return (
    !fields.openingStock.trim() &&
    !fields.primarySale.trim() &&
    !fields.physicalStock.trim()
  );
}

export function isValidProductStock(fields: ProductStockFields): boolean {
  const opening = parseNumber(fields.openingStock);
  const primary = parseNumber(fields.primarySale);
  const physical = parseNumber(fields.physicalStock);
  return opening !== null && primary !== null && physical !== null;
}

export function isPartialProductStock(fields: ProductStockFields): boolean {
  return !isEmptyProductStock(fields) && !isValidProductStock(fields);
}

/** Full section filled, or all blank. Partial fill is an error. */
export function resolveProductStock(
  fields: ProductStockFields
): { ok: true; data: ProductStock; skipped: boolean } | { ok: false; reason: 'partial' } {
  if (isEmptyProductStock(fields)) {
    return { ok: true, data: EMPTY_PRODUCT_STOCK, skipped: true };
  }
  if (!isValidProductStock(fields)) {
    return { ok: false, reason: 'partial' };
  }
  return { ok: true, data: toProductStock(fields), skipped: false };
}

export function toProductStock(fields: ProductStockFields) {
  const opening = parseNumber(fields.openingStock)!;
  const primary = parseNumber(fields.primarySale)!;
  const physical = parseNumber(fields.physicalStock)!;
  return {
    openingStock: opening,
    primarySale: primary,
    physicalStock: physical,
    secondarySale: calculateSecondarySale(opening, primary, physical),
  };
}

function StockField({
  label,
  value,
  onChangeText,
  editable,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  editable: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        keyboardType="decimal-pad"
        placeholder="0"
        placeholderTextColor="#94a3b8"
        editable={editable}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    borderRadius: AppTheme.radius.lg,
    borderWidth: 1.5,
    padding: AppTheme.spacing.md,
    gap: 12,
    marginBottom: 4,
    ...AppTheme.shadow.card,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  optionalHint: {
    fontSize: 12,
    color: AppTheme.colors.textSecondary,
    marginBottom: 4,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: AppTheme.colors.text,
  },
  input: {
    backgroundColor: AppTheme.colors.surface,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    borderRadius: AppTheme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: '500',
    color: AppTheme.colors.text,
  },
  secondaryBox: {
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  secondaryLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: AppTheme.colors.text,
  },
  secondaryHint: {
    marginTop: 2,
    fontSize: 11,
    color: AppTheme.colors.textSecondary,
  },
  secondaryValue: {
    marginTop: 8,
    fontSize: 26,
    fontWeight: '800',
  },
});
