import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { SkuFifoCard } from '@/components/sku-fifo-card';
import { SuccessToast } from '@/components/success-toast';
import { ALL_PRODUCT_SKUS, CSD_SKU_GROUPS, CSD_SKUS, KINLEY_WATER_SKUS } from '@/constants/products';
import { AppTheme } from '@/constants/app-theme';
import {
  buildSkuLotsFromPrefill,
  createInitialSkuLots,
  resolveSkuCatalogLots,
  type SkuDetailSubmission,
  type SkuLotsState,
} from '@/lib/sku-stock';
import { fetchLastSkuPrefill, type ProductStock } from '@/lib/sheets';

export type SubmitResult = { ok: true } | { ok: false; message: string };

export type StockFormSubmitPayload = {
  csd: ProductStock;
  kinleyWater: ProductStock;
  skuDetails: SkuDetailSubmission[];
};

type StockFormProps = {
  distributorLabel: string;
  submittedByLabel: string;
  zoneLabel: string;
  onSubmit: (values: StockFormSubmitPayload) => Promise<SubmitResult>;
  onBack: () => void;
};

export function StockForm({
  distributorLabel,
  submittedByLabel,
  zoneLabel,
  onSubmit,
  onBack,
}: StockFormProps) {
  const allSkuIds = useMemo(() => ALL_PRODUCT_SKUS.map((s) => s.id), []);

  const [skuLots, setSkuLots] = useState<SkuLotsState>(() => createInitialSkuLots(allSkuIds));
  const [loadingPrefill, setLoadingPrefill] = useState(true);
  const [prefillHint, setPrefillHint] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPreviousLots() {
      setLoadingPrefill(true);
      setPrefillHint(null);

      const result = await fetchLastSkuPrefill(zoneLabel, distributorLabel);

      if (cancelled) return;

      if (result.ok && result.skuLots.length > 0) {
        setSkuLots(buildSkuLotsFromPrefill(ALL_PRODUCT_SKUS, result.skuLots));
        const skuCount = new Set(result.skuLots.map((l) => l.productSku)).size;
        setPrefillHint(
          `Loaded MFG date, batch no. and BBD from your last entry for this shop (${skuCount} SKU${skuCount === 1 ? '' : 's'}). Enter today's stock only.`
        );
      } else {
        setSkuLots(createInitialSkuLots(allSkuIds));
      }

      setLoadingPrefill(false);
    }

    void loadPreviousLots();

    return () => {
      cancelled = true;
    };
  }, [zoneLabel, distributorLabel, allSkuIds]);

  const updateSkuLots = (skuId: string, lots: SkuLotsState[string]) => {
    setSkuLots((prev) => ({ ...prev, [skuId]: lots }));
  };

  const handleSubmit = async () => {
    setError(null);

    const csdResult = resolveSkuCatalogLots(skuLots, CSD_SKUS);
    if (!csdResult.ok) {
      setError(csdResult.message);
      return;
    }

    const kinleyResult = resolveSkuCatalogLots(skuLots, KINLEY_WATER_SKUS);
    if (!kinleyResult.ok) {
      setError(kinleyResult.message);
      return;
    }

    if (!csdResult.hasData && !kinleyResult.hasData) {
      setError('Enter stock for at least one CSD or Kinley Water SKU lot.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await onSubmit({
        csd: csdResult.aggregate,
        kinleyWater: kinleyResult.aggregate,
        skuDetails: [...csdResult.skuDetails, ...kinleyResult.skuDetails],
      });

      if (result.ok) {
        setSuccessMessage(`Stock updated successfully for ${distributorLabel}.`);
        setSkuLots(createInitialSkuLots(allSkuIds));
      } else {
        setError(result.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SuccessToast
        message={successMessage ?? ''}
        visible={successMessage !== null}
        onHide={() => setSuccessMessage(null)}
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.contextCard}>
          <View style={styles.contextRow}>
            <Ionicons name="location-outline" size={18} color={AppTheme.colors.primary} />
            <Text style={styles.contextBadge}>{zoneLabel}</Text>
          </View>
          <View style={styles.divider} />
          <ContextRow icon="person-outline" label="Submitted by" value={submittedByLabel} />
          <ContextRow icon="storefront-outline" label="Distributor" value={distributorLabel} />
          <Text style={styles.formHint}>
            Enter each SKU by FIFO lot (scroll right for BBD and stock). MFG, batch and BBD carry
            over from your last save for this shop — update stock for today only.
          </Text>
          {loadingPrefill ? (
            <View style={styles.prefillBanner}>
              <ActivityIndicator size="small" color={AppTheme.colors.primary} />
              <Text style={styles.prefillText}>Loading previous MFG / batch / BBD…</Text>
            </View>
          ) : prefillHint ? (
            <View style={styles.prefillBanner}>
              <Ionicons name="information-circle-outline" size={18} color={AppTheme.colors.primary} />
              <Text style={styles.prefillText}>{prefillHint}</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.sectionHeading}>CSD — by SKU</Text>
        {CSD_SKU_GROUPS.map((group) => (
          <View key={group.line} style={styles.skuGroup}>
            <Text style={[styles.groupLabel, { color: group.accentColor }]}>{group.line}</Text>
            {group.skus.map((sku) => (
              <SkuFifoCard
                key={sku.id}
                sku={sku}
                lots={skuLots[sku.id] ?? []}
                editable={!submitting && !loadingPrefill}
                onChangeLots={(lots) => updateSkuLots(sku.id, lots)}
              />
            ))}
          </View>
        ))}

        <Text style={[styles.sectionHeading, styles.kinleySectionHeading]}>
          Kinley Water — by SKU
        </Text>
        {KINLEY_WATER_SKUS.map((sku) => (
          <SkuFifoCard
            key={sku.id}
            sku={sku}
            lots={skuLots[sku.id] ?? []}
            editable={!submitting && !loadingPrefill}
            onChangeLots={(lots) => updateSkuLots(sku.id, lots)}
          />
        ))}

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color={AppTheme.colors.error} />
            <Text style={styles.error}>{error}</Text>
          </View>
        ) : null}

        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            pressed && styles.submitButtonPressed,
            submitting && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={submitting || loadingPrefill}>
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={22} color="#fff" />
              <Text style={styles.submitText}>Submit</Text>
            </>
          )}
        </Pressable>

        <Pressable style={styles.backButton} onPress={onBack} disabled={submitting}>
          <Text style={styles.backText}>Change shop</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ContextRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.contextItem}>
      <Ionicons name={icon} size={16} color={AppTheme.colors.textSecondary} />
      <View style={styles.contextItemText}>
        <Text style={styles.contextLabel}>{label}</Text>
        <Text style={styles.contextValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    paddingBottom: 32,
    gap: 14,
  },
  contextCard: {
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.radius.lg,
    padding: AppTheme.spacing.md,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    ...AppTheme.shadow.card,
  },
  contextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contextBadge: {
    fontSize: 13,
    fontWeight: '700',
    color: AppTheme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: AppTheme.colors.border,
    marginVertical: 12,
  },
  contextItem: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  contextItemText: {
    flex: 1,
  },
  contextLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: AppTheme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  contextValue: {
    marginTop: 2,
    fontSize: 15,
    fontWeight: '600',
    color: AppTheme.colors.text,
  },
  formHint: {
    marginTop: 4,
    fontSize: 13,
    color: AppTheme.colors.textSecondary,
    lineHeight: 19,
  },
  prefillBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 10,
    padding: 10,
    borderRadius: AppTheme.radius.md,
    backgroundColor: AppTheme.colors.accentSoft,
    borderWidth: 1,
    borderColor: AppTheme.colors.accentSoftBorder,
  },
  prefillText: {
    flex: 1,
    fontSize: 12,
    color: AppTheme.colors.text,
    lineHeight: 18,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: AppTheme.colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  kinleySectionHeading: {
    color: AppTheme.colors.kinley,
  },
  skuGroup: {
    gap: 12,
  },
  groupLabel: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: -4,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: AppTheme.colors.errorBg,
    padding: 12,
    borderRadius: AppTheme.radius.md,
  },
  error: {
    flex: 1,
    color: AppTheme.colors.error,
    fontSize: 14,
    lineHeight: 20,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: AppTheme.colors.primary,
    borderRadius: AppTheme.radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
    ...AppTheme.shadow.button,
  },
  submitButtonPressed: {
    backgroundColor: AppTheme.colors.primaryDark,
  },
  submitButtonDisabled: {
    opacity: 0.75,
  },
  submitText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  backText: {
    color: AppTheme.colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
});
