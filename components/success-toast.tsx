import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';

import { AppTheme } from '@/constants/app-theme';

type SuccessToastProps = {
  message: string;
  visible: boolean;
  onHide: () => void;
  durationMs?: number;
};

export function SuccessToast({
  message,
  visible,
  onHide,
  durationMs = 3500,
}: SuccessToastProps) {
  useEffect(() => {
    if (!visible) return;
    const id = setTimeout(onHide, durationMs);
    return () => clearTimeout(id);
  }, [visible, durationMs, onHide]);

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeInUp.duration(280)}
      exiting={FadeOutUp.duration(220)}
      style={styles.wrap}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite">
      <View style={styles.toast}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={22} color={AppTheme.colors.success} />
        </View>
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    zIndex: 100,
    pointerEvents: 'none',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: AppTheme.colors.successBg,
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: AppTheme.radius.lg,
    paddingVertical: 14,
    paddingHorizontal: 16,
    ...AppTheme.shadow.card,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: AppTheme.colors.success,
    lineHeight: 21,
  },
});
