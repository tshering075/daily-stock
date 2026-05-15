import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { AppTheme } from '@/constants/app-theme';

type BackLinkProps = {
  label: string;
  onPress: () => void;
};

export function BackLink({ label, onPress }: BackLinkProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}
      onPress={onPress}
      hitSlop={8}>
      <Ionicons name="chevron-back" size={20} color={AppTheme.colors.primary} />
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: AppTheme.spacing.md,
    alignSelf: 'flex-start',
  },
  pressed: {
    opacity: 0.7,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
    color: AppTheme.colors.primary,
  },
});
