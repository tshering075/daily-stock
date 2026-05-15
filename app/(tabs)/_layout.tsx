import { Image } from 'expo-image';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { AppTheme } from '@/constants/app-theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: AppTheme.colors.primary,
        tabBarInactiveTintColor: AppTheme.colors.textSecondary,
        tabBarStyle: styles.tabBar,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Daily Stock',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Image
                source={require('@/assets/images/logo.png')}
                style={styles.tabIcon}
                contentFit="cover"
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: AppTheme.colors.surface,
    borderTopColor: AppTheme.colors.border,
    height: 60,
    paddingBottom: 6,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    overflow: 'hidden',
    opacity: 0.65,
  },
  iconWrapActive: {
    opacity: 1,
  },
  tabIcon: {
    width: 28,
    height: 28,
  },
});
