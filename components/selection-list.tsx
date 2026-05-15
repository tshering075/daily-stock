import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppTheme } from '@/constants/app-theme';

export type SelectionItem = {
  id: string;
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBg?: string;
};

type SelectionListProps = {
  items: SelectionItem[];
  onSelect: (id: string) => void;
};

export function SelectionList({ items, onSelect }: SelectionListProps) {
  return (
    <View style={styles.list}>
      {items.map((item) => (
        <Pressable
          key={item.id}
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelect(item.id);
          }}>
          {item.icon ? (
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: item.iconBg ?? AppTheme.colors.surfaceMuted },
              ]}>
              <Ionicons
                name={item.icon}
                size={22}
                color={item.iconColor ?? AppTheme.colors.primary}
              />
            </View>
          ) : null}
          <View style={styles.textWrap}>
            <Text style={styles.title}>{item.title}</Text>
            {item.subtitle ? <Text style={styles.subtitle}>{item.subtitle}</Text> : null}
          </View>
          <Ionicons name="chevron-forward" size={20} color={AppTheme.colors.textSecondary} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.radius.lg,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    gap: 12,
    ...AppTheme.shadow.card,
  },
  cardPressed: {
    backgroundColor: AppTheme.colors.accentSoft,
    borderColor: AppTheme.colors.primaryLight,
    transform: [{ scale: 0.99 }],
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: AppTheme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: AppTheme.colors.text,
  },
  subtitle: {
    marginTop: 3,
    fontSize: 13,
    color: AppTheme.colors.textSecondary,
    lineHeight: 18,
  },
});
