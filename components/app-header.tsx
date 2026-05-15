import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { AppLogo } from '@/components/app-logo';
import { StepProgress } from '@/components/step-progress';
import { AppTheme } from '@/constants/app-theme';

type AppHeaderProps = {
  stepLabels: string[];
  stepIndex: number;
  warning?: string | null;
};

export function AppHeader({ stepLabels, stepIndex, warning }: AppHeaderProps) {
  return (
    <LinearGradient
      colors={[...AppTheme.colors.headerGradient]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}>
      <View style={styles.brandRow}>
        <AppLogo size={52} />
        <View style={styles.brandText}>
          <Text style={styles.title}>Daily Stock</Text>
          <Text style={styles.subtitle}>CSD & Kinley Water</Text>
        </View>
      </View>

      {warning ? (
        <View style={styles.warning}>
          <Text style={styles.warningText}>{warning}</Text>
        </View>
      ) : null}

      <StepProgress labels={stepLabels} currentIndex={stepIndex} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    paddingHorizontal: AppTheme.spacing.md,
    paddingTop: AppTheme.spacing.sm,
    paddingBottom: AppTheme.spacing.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  brandText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: AppTheme.colors.textOnPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 14,
    color: AppTheme.colors.textOnPrimaryMuted,
    fontWeight: '500',
  },
  warning: {
    marginTop: AppTheme.spacing.md,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: AppTheme.radius.md,
    padding: AppTheme.spacing.sm + 4,
  },
  warningText: {
    fontSize: 12,
    color: AppTheme.colors.warning,
    lineHeight: 18,
  },
});
