import { Ionicons } from '@expo/vector-icons';
import { useMemo, type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { DateField } from '@/components/date-field';
import type { ProductSku } from '@/constants/products';
import { AppTheme } from '@/constants/app-theme';
import {
  computeSkuSubtotal,
  createEmptyLot,
  resolveSkuLots,
  type FifoLotFields,
} from '@/lib/sku-stock';

const COL_GAP = 10;

const COL = {
  num: 32,
  date: 136,
  batch: 108,
  stock: 88,
  action: 32,
};

type SkuFifoCardProps = {
  sku: ProductSku;
  lots: FifoLotFields[];
  editable: boolean;
  onChangeLots: (lots: FifoLotFields[]) => void;
};

export function SkuFifoCard({ sku, lots, editable, onChangeLots }: SkuFifoCardProps) {
  const preview = useMemo(() => {
    const result = resolveSkuLots(sku.id, sku.name, lots);
    if (!result.ok || result.skipped) {
      return { opening: 0, secondary: 0, physical: 0 };
    }
    return result.subtotal;
  }, [lots, sku.id, sku.name]);

  const updateLot = (index: number, patch: Partial<FifoLotFields>) => {
    const next = lots.map((lot, i) => (i === index ? { ...lot, ...patch } : lot));
    onChangeLots(next);
  };

  const addLot = () => {
    onChangeLots([...lots, createEmptyLot()]);
  };

  const removeLot = (index: number) => {
    if (lots.length <= 1) {
      onChangeLots([createEmptyLot()]);
      return;
    }
    onChangeLots(lots.filter((_, i) => i !== index));
  };

  return (
    <View style={[styles.card, { borderLeftColor: sku.accentColor }]}>
      <Text style={[styles.title, { color: sku.accentColor }]}>{sku.name}</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.tableScroll}>
        <View>
          <View style={styles.headerRow}>
            <TableCell width={COL.num}>
              <Text style={[styles.headerCell, styles.colNumText]}>#</Text>
            </TableCell>
            <TableCell width={COL.date}>
              <Text style={styles.headerCell}>MFG date</Text>
            </TableCell>
            <TableCell width={COL.batch}>
              <Text style={styles.headerCell}>Batch no.</Text>
            </TableCell>
            <TableCell width={COL.date}>
              <Text style={styles.headerCell}>BBD date</Text>
            </TableCell>
            <TableCell width={COL.stock}>
              <Text style={styles.headerCell}>Opening</Text>
            </TableCell>
            <TableCell width={COL.stock}>
              <Text style={styles.headerCell}>Primary</Text>
            </TableCell>
            <TableCell width={COL.stock}>
              <Text style={styles.headerCell}>Physical</Text>
            </TableCell>
            <TableCell width={COL.stock}>
              <Text style={styles.headerCell}>Secondary</Text>
            </TableCell>
            <TableCell width={COL.action} />
          </View>

          {lots.map((lot, index) => (
            <LotRow
              key={`${sku.id}-lot-${index}`}
              lotNo={index + 1}
              lot={lot}
              editable={editable}
              canRemove={lots.length > 1}
              onChange={(patch) => updateLot(index, patch)}
              onRemove={() => removeLot(index)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.subtotal}>
          SKU subtotal (all lots):{' '}
          <Text style={styles.subtotalBold}>
            O {preview.opening} · S {preview.secondary} · C {preview.physical}
          </Text>
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            { borderColor: sku.accentColor },
            pressed && styles.addButtonPressed,
            !editable && styles.addButtonDisabled,
          ]}
          onPress={addLot}
          disabled={!editable}>
          <Ionicons name="add-circle-outline" size={18} color={sku.accentColor} />
          <Text style={[styles.addButtonText, { color: sku.accentColor }]}>Add FIFO lot</Text>
        </Pressable>
      </View>
    </View>
  );
}

function LotRow({
  lotNo,
  lot,
  editable,
  canRemove,
  onChange,
  onRemove,
}: {
  lotNo: number;
  lot: FifoLotFields;
  editable: boolean;
  canRemove: boolean;
  onChange: (patch: Partial<FifoLotFields>) => void;
  onRemove: () => void;
}) {
  const opening = Number(lot.openingStock) || 0;
  const primary = Number(lot.primarySale) || 0;
  const physical = Number(lot.physicalStock) || 0;
  const secondary =
    lot.openingStock.trim() && lot.primarySale.trim() && lot.physicalStock.trim()
      ? opening + primary - physical
      : null;

  return (
    <View style={styles.dataRow}>
      <TableCell width={COL.num}>
        <Text style={styles.lotNum}>{lotNo}</Text>
      </TableCell>
      <TableCell width={COL.date}>
        <DateField
          width={COL.date}
          value={lot.mfgDate}
          editable={editable}
          onChange={(v) => onChange({ mfgDate: v })}
        />
      </TableCell>
      <TableCell width={COL.batch}>
        <CellInput
          width={COL.batch}
          value={lot.batchNo}
          placeholder="Batch"
          editable={editable}
          onChangeText={(v) => onChange({ batchNo: v })}
        />
      </TableCell>
      <TableCell width={COL.date}>
        <DateField
          width={COL.date}
          value={lot.bbdDate}
          editable={editable}
          onChange={(v) => onChange({ bbdDate: v })}
        />
      </TableCell>
      <TableCell width={COL.stock}>
        <CellInput
          width={COL.stock}
          value={lot.openingStock}
          placeholder="0"
          keyboardType="decimal-pad"
          editable={editable}
          onChangeText={(v) => onChange({ openingStock: v })}
        />
      </TableCell>
      <TableCell width={COL.stock}>
        <CellInput
          width={COL.stock}
          value={lot.primarySale}
          placeholder="0"
          keyboardType="decimal-pad"
          editable={editable}
          onChangeText={(v) => onChange({ primarySale: v })}
        />
      </TableCell>
      <TableCell width={COL.stock}>
        <CellInput
          width={COL.stock}
          value={lot.physicalStock}
          placeholder="0"
          keyboardType="decimal-pad"
          editable={editable}
          onChangeText={(v) => onChange({ physicalStock: v })}
        />
      </TableCell>
      <TableCell width={COL.stock}>
        <View style={styles.secondaryCell}>
          <Text style={styles.secondaryValue} numberOfLines={1}>
            {secondary !== null ? secondary : '—'}
          </Text>
        </View>
      </TableCell>
      <TableCell width={COL.action}>
        <Pressable
          style={styles.removeBtn}
          onPress={onRemove}
          disabled={!editable || !canRemove}
          hitSlop={8}>
          <Ionicons
            name="trash-outline"
            size={18}
            color={canRemove && editable ? AppTheme.colors.textSecondary : 'transparent'}
          />
        </Pressable>
      </TableCell>
    </View>
  );
}

function TableCell({ width, children }: { width: number; children?: ReactNode }) {
  return <View style={{ width, flexShrink: 0, flexGrow: 0 }}>{children}</View>;
}

function CellInput({
  value,
  placeholder,
  editable,
  keyboardType = 'default',
  onChangeText,
}: {
  width: number;
  value: string;
  placeholder: string;
  editable: boolean;
  keyboardType?: 'default' | 'decimal-pad';
  onChangeText: (v: string) => void;
}) {
  return (
    <TextInput
      style={styles.cellInput}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#94a3b8"
      editable={editable}
      keyboardType={keyboardType}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.radius.lg,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    borderLeftWidth: 4,
    padding: AppTheme.spacing.md,
    gap: 10,
    ...AppTheme.shadow.card,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
  tableScroll: {
    paddingBottom: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: COL_GAP,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.border,
  },
  headerCell: {
    fontSize: 11,
    fontWeight: '700',
    color: AppTheme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  colNumText: {
    textAlign: 'center',
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: COL_GAP,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AppTheme.colors.border,
  },
  lotNum: {
    width: '100%',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: AppTheme.colors.text,
  },
  cellInput: {
    width: '100%',
    backgroundColor: AppTheme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    borderRadius: AppTheme.radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 14,
    color: AppTheme.colors.text,
  },
  secondaryCell: {
    width: '100%',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  secondaryValue: {
    fontSize: 15,
    fontWeight: '700',
    color: AppTheme.colors.text,
    textAlign: 'center',
  },
  footer: {
    gap: 10,
    marginTop: 4,
  },
  subtotal: {
    fontSize: 12,
    color: AppTheme.colors.textSecondary,
    lineHeight: 18,
  },
  subtotalBold: {
    fontWeight: '700',
    color: AppTheme.colors.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    alignSelf: 'flex-end',
    borderWidth: 1.5,
    borderRadius: AppTheme.radius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  addButtonPressed: {
    opacity: 0.85,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  removeBtn: {
    padding: 4,
  },
});
