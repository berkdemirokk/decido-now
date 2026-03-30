import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../theme';

interface LiveActivityMockProps {
  stepName: string;
  progress: number;
  timeRemaining: string;
}

export function LiveActivityMock({
  stepName,
  progress,
  timeRemaining,
}: LiveActivityMockProps) {
  return (
    <View style={styles.shell}>
      <View style={styles.row}>
        <Text numberOfLines={1} style={styles.stepName}>
          {stepName}
        </Text>
        <Text style={styles.time}>{timeRemaining}</Text>
      </View>
      <View style={styles.bar}>
        <View style={[styles.fill, { width: `${Math.max(6, progress * 100)}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    backgroundColor: 'rgba(16,20,28,0.92)',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  stepName: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.typography.label,
    fontWeight: '700',
  },
  time: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.label,
    fontWeight: '700',
  },
  bar: {
    height: 6,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: theme.colors.accent,
  },
});
