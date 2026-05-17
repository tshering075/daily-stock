import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
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

import {
  ProductStockSection,
  type ProductStockFields,
  resolveProductStock,
} from '@/components/product-stock-section';
import { SuccessToast } from '@/components/success-toast';
import { AppTheme } from '@/constants/app-theme';
import type { ProductStock } from '@/lib/sheets';

export type SubmitResult = { ok: true } | { ok: false; message: string };

const EMPTY: ProductStockFields = {
  openingStock: '',
  primarySale: '',
  physicalStock: '',
};

type StockFormProps = {
  distributorLabel: string;
  submittedByLabel: string;
  zoneLabel: string;
  onSubmit: (values: {
    csd: ProductStock;
    kinleyWater: ProductStock;
  }) => Promise<SubmitResult>;
  onBack: () => void;
};

export function StockForm({
  distributorLabel,
  submittedByLabel,
  zoneLabel,
  onSubmit,
  onBack,
}: StockFormProps) {
  const [csd, setCsd] = useState<ProductStockFields>({ ...EMPTY });
  const [kinleyWater, setKinleyWater] = useState<ProductStockFields>({ ...EMPTY });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);

    const csdResult = resolveProductStock(csd);
    const kinleyResult = resolveProductStock(kinleyWater);

    if (!csdResult.ok) {
      setError('CSD: fill all three fields, or leave the whole section blank.');
      return;
    }
    if (!kinleyResult.ok) {
      setError('Kinley Water: fill all three fields, or leave the whole section blank.');
      return;
    }
    if (csdResult.skipped && kinleyResult.skipped) {
      setError('Enter stock for at least CSD or Kinley Water.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await onSubmit({
        csd: csdResult.data,
        kinleyWater: kinleyResult.data,
      });

      if (result.ok) {
        setSuccessMessage(`Stock updated successfully for ${distributorLabel}.`);
        setCsd({ ...EMPTY });
        setKinleyWater({ ...EMPTY });
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
            Update CSD only, Kinley Water only, or both. Leave a section blank if not reporting
            today.
          </Text>
        </View>

        <ProductStockSection
          title="CSD"
          accentColor={AppTheme.colors.csd}
          accentBg={AppTheme.colors.csdBg}
          values={csd}
          onChange={(field, value) => setCsd((prev) => ({ ...prev, [field]: value }))}
          editable={!submitting}
        />

        <ProductStockSection
          title="Kinley Water"
          accentColor={AppTheme.colors.kinley}
          accentBg={AppTheme.colors.kinleyBg}
          values={kinleyWater}
          onChange={(field, value) => setKinleyWater((prev) => ({ ...prev, [field]: value }))}
          editable={!submitting}
        />

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
          disabled={submitting}>
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
