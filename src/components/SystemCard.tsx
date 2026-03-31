import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../theme';

interface SystemCardProps {
  title: string;
  promise: string;
  metric: string;
  body: string;
  accent: string;
  activeLabel?: string;
  cta: string;
  onPress: () => void;
}

export function SystemCard({
  title,
  promise,
  metric,
  body,
  accent,
  activeLabel,
  cta,
  onPress,
}: SystemCardProps) {
  return (
    <Pressable onPress={onPress} style={[styles.card, { borderColor: `${accent}44` }]}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <View style={[styles.accentBar, { backgroundColor: accent }]} />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.promise}>{promise}</Text>
        </View>
        {activeLabel ? (
          <View style={styles.activePill}>
            <Text style={styles.activeText}>{activeLabel}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.metricRow}>
        <View style={[styles.metricPill, { borderColor: `${accent}33` }]}>
          <Text style={[styles.metric, { color: accent }]}>{metric}</Text>
        </View>
      </View>

      <Text style={styles.body}>{body}</Text>

      <View style={styles.footer}>
        <Text style={[styles.cta, { color: accent }]}>{cta}</Text>
        <Text style={[styles.arrow, { color: accent }]}>→</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  headerCopy: {
    flex: 1,
    gap: 6,
  },
  accentBar: {
    width: 56,
    height: 4,
    borderRadius: theme.radius.pill,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.h2,
    fontWeight: '700',
  },
  promise: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  activePill: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.accentSoft,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
  },
  activeText: {
    color: theme.colors.accent,
    fontSize: theme.typography.meta,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  metricRow: {
    flexDirection: 'row',
  },
  metricPill: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
  },
  metric: {
    fontSize: theme.typography.body,
    fontWeight: '800',
  },
  body: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cta: {
    fontSize: theme.typography.body,
    fontWeight: '800',
  },
  arrow: {
    fontSize: 18,
    fontWeight: '900',
  },
});
