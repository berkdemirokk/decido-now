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
      <View style={[styles.accentBar, { backgroundColor: accent }]} />
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.promise}>{promise}</Text>
        </View>
        {activeLabel ? (
          <View style={styles.activePill}>
            <Text style={styles.activeText}>{activeLabel}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.metric}>{metric}</Text>
      <Text style={styles.body}>{body}</Text>
      <Text style={[styles.cta, { color: accent }]}>{cta}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  accentBar: {
    width: 52,
    height: 4,
    borderRadius: theme.radius.pill,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.h2,
    fontWeight: '700',
  },
  promise: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
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
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  metric: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  body: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  cta: {
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
});
