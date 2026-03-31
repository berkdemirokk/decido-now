import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../theme';

interface DNAInsightCardProps {
  eyebrow: string;
  title: string;
  body: string;
  metric: string;
  locked?: boolean;
  onPress?: () => void;
}

export function DNAInsightCard({
  eyebrow,
  title,
  body,
  metric,
  locked,
  onPress,
}: DNAInsightCardProps) {
  return (
    <Pressable disabled={!onPress} onPress={onPress} style={[styles.card, locked ? styles.cardLocked : null]}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      <View style={styles.metricPill}>
        <Text style={styles.metric}>{locked ? 'Pro' : metric}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  cardLocked: {
    backgroundColor: theme.colors.surfaceAlt,
    borderColor: theme.colors.borderStrong,
  },
  eyebrow: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.meta,
    fontWeight: '700',
    letterSpacing: 1,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.h2,
    fontWeight: '700',
  },
  body: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  metricPill: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
  },
  metric: {
    color: theme.colors.text,
    fontSize: theme.typography.meta,
    fontWeight: '700',
  },
});
