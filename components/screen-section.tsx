import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppTheme } from '@/constants/app-theme';

type ScreenSectionProps = {
  title: string;
  hint?: string;
  children?: ReactNode;
};

export function ScreenSection({ title, hint, children }: ScreenSectionProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: AppTheme.spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: AppTheme.colors.text,
    letterSpacing: -0.3,
  },
  hint: {
    marginTop: AppTheme.spacing.sm,
    fontSize: 14,
    color: AppTheme.colors.textSecondary,
    lineHeight: 21,
  },
});
