import { StyleSheet, Text, View } from 'react-native';

import { AppTheme } from '@/constants/app-theme';

type StepProgressProps = {
  labels: string[];
  currentIndex: number;
};

export function StepProgress({ labels, currentIndex }: StepProgressProps) {
  return (
    <View style={styles.wrap}>
      {labels.map((label, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <View key={label} style={styles.item}>
            <View style={styles.track}>
              {i > 0 ? (
                <View style={[styles.line, i <= currentIndex && styles.lineDone]} />
              ) : null}
              <View
                style={[
                  styles.dot,
                  active && styles.dotActive,
                  done && styles.dotDone,
                ]}>
                <Text
                  style={[
                    styles.dotText,
                    (active || done) && styles.dotTextActive,
                  ]}>
                  {done ? '✓' : i + 1}
                </Text>
              </View>
              {i < labels.length - 1 ? (
                <View
                  style={[styles.line, styles.lineRight, i < currentIndex && styles.lineDone]}
                />
              ) : null}
            </View>
            <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    marginTop: AppTheme.spacing.lg,
  },
  item: {
    flex: 1,
    alignItems: 'center',
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
    maxWidth: '40%',
  },
  lineRight: {},
  lineDone: {
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  dot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dotActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
    transform: [{ scale: 1.08 }],
  },
  dotDone: {
    backgroundColor: AppTheme.colors.accentSoft,
    borderColor: AppTheme.colors.accentSoftBorder,
  },
  dotText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.75)',
  },
  dotTextActive: {
    color: AppTheme.colors.primaryDark,
  },
  label: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    paddingHorizontal: 2,
  },
  labelActive: {
    color: '#fff',
    fontWeight: '700',
  },
});
