import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

import { GOOGLE_SHEET_VIEW_URL, isSheetViewConfigured } from '@/constants/config';
import { AppTheme } from '@/constants/app-theme';

export function SheetViewLink() {
  if (!isSheetViewConfigured) return null;

  const openSheet = () => {
    void WebBrowser.openBrowserAsync(GOOGLE_SHEET_VIEW_URL);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.hint}>View submitted stock data in Google Sheets</Text>
      <Pressable
        style={({ pressed }) => [styles.link, pressed && styles.linkPressed]}
        onPress={openSheet}
        accessibilityRole="link"
        accessibilityLabel="Open Google Sheet">
        <Ionicons name="logo-google" size={20} color={AppTheme.colors.primary} />
        <Text style={styles.linkText}>Open Google Sheet</Text>
        <Ionicons name="open-outline" size={18} color={AppTheme.colors.textSecondary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: AppTheme.spacing.lg,
    paddingTop: AppTheme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: AppTheme.colors.border,
    gap: 10,
  },
  hint: {
    fontSize: 13,
    color: AppTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: AppTheme.colors.surface,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    borderRadius: AppTheme.radius.lg,
    paddingVertical: 14,
    paddingHorizontal: 16,
    ...AppTheme.shadow.card,
  },
  linkPressed: {
    backgroundColor: AppTheme.colors.surfaceMuted,
  },
  linkText: {
    fontSize: 15,
    fontWeight: '600',
    color: AppTheme.colors.primary,
  },
});
