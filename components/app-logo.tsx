import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { AppTheme } from '@/constants/app-theme';

type AppLogoProps = {
  size?: number;
};

export function AppLogo({ size = 48 }: AppLogoProps) {
  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size * 0.22 }]}>
      <Image
        source={require('@/assets/images/logo.png')}
        style={{ width: size, height: size }}
        contentFit="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    backgroundColor: AppTheme.colors.surface,
    ...AppTheme.shadow.card,
  },
});
