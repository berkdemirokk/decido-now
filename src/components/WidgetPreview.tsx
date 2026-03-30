import { StyleSheet, Text, View } from 'react-native';

import { SystemId } from '../types';
import { systemAccents, theme } from '../theme';

interface WidgetPreviewProps {
  size: 'small' | 'medium';
  systemId: SystemId;
  moveTitle: string;
  timeLeft: string;
  progress: number;
}

export function WidgetPreview({
  size,
  systemId,
  moveTitle,
  timeLeft,
  progress,
}: WidgetPreviewProps) {
  const accent = systemAccents[systemId];

  if (size === 'small') {
    return (
      <View style={[styles.shell, styles.smallShell]}>
        <View style={[styles.ring, { borderColor: `${accent}66` }]}>
          <View style={[styles.ringFill, { borderColor: accent, transform: [{ rotate: `${progress * 240}deg` }] }]} />
          <View style={[styles.centerDot, { backgroundColor: accent }]} />
        </View>
        <Text style={styles.iconLabel}>{systemId.toUpperCase()}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.shell, styles.mediumShell]}>
      <View style={styles.mediumTop}>
        <Text style={styles.mediumTitle} numberOfLines={2}>
          {moveTitle}
        </Text>
        <Text style={styles.timeLabel}>{timeLeft}</Text>
      </View>
      <View style={styles.bar}>
        <View style={[styles.fill, { width: `${Math.max(8, progress * 100)}%`, backgroundColor: accent }]} />
      </View>
      <View style={styles.mediumBottom}>
        <Text style={styles.startLink}>Start</Text>
        <Text style={styles.deepLinkHint}>decidonow://start</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    backgroundColor: '#090d14',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    ...theme.shadow.card,
  },
  smallShell: {
    width: 138,
    height: 138,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  ring: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringFill: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 6,
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  centerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  iconLabel: {
    color: theme.colors.text,
    fontSize: theme.typography.meta,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  mediumShell: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  mediumTop: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  mediumTitle: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: '700',
    lineHeight: 22,
  },
  timeLabel: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.label,
    fontWeight: '700',
  },
  bar: {
    height: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceAlt,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
  mediumBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  startLink: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: '800',
  },
  deepLinkHint: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.meta,
    fontWeight: '700',
  },
});
