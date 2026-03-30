import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Suggestion } from '../types';
import { theme } from '../theme';

interface PrimaryMoveCardProps {
  move: Suggestion;
  reason: string;
  todayGain: string;
  tomorrowGain: string;
  streakLabel: string;
  levelLabel: string;
  primaryCta: string;
  secondaryWhy: string;
  secondarySwap: string;
  tertiaryRefine: string;
  tertiaryShare: string;
  onStart: () => void;
  onWhy: () => void;
  onSwap: () => void;
  onRefine: () => void;
  onShare: () => void;
}

export function PrimaryMoveCard({
  move,
  reason,
  todayGain,
  tomorrowGain,
  streakLabel,
  levelLabel,
  primaryCta,
  secondaryWhy,
  secondarySwap,
  tertiaryRefine,
  tertiaryShare,
  onStart,
  onWhy,
  onSwap,
  onRefine,
  onShare,
}: PrimaryMoveCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.metaRow}>
        <View style={styles.metaPill}>
          <Text style={styles.metaText}>{streakLabel}</Text>
        </View>
        <View style={styles.metaPill}>
          <Text style={styles.metaText}>{levelLabel}</Text>
        </View>
      </View>

      <Text style={styles.title}>{move.title}</Text>
      <Text style={styles.action}>{move.action}</Text>

      <View style={styles.copyBlock}>
        <Text style={styles.label}>WHY THIS FITS</Text>
        <Text style={styles.body}>{reason}</Text>
      </View>

      <View style={styles.copyBlock}>
        <Text style={styles.label}>TODAY</Text>
        <Text style={styles.body}>{todayGain}</Text>
      </View>

      <View style={styles.copyBlock}>
        <Text style={styles.label}>TOMORROW</Text>
        <Text style={styles.body}>{tomorrowGain}</Text>
      </View>

      <Pressable onPress={onStart} style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>{primaryCta}</Text>
      </Pressable>

      <View style={styles.secondaryRow}>
        <Pressable onPress={onWhy} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>{secondaryWhy}</Text>
        </Pressable>
        <Pressable onPress={onSwap} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>{secondarySwap}</Text>
        </Pressable>
      </View>

      <View style={styles.secondaryRow}>
        <Pressable onPress={onRefine} style={styles.linkButton}>
          <Text style={styles.linkButtonText}>{tertiaryRefine}</Text>
        </Pressable>
        <Pressable onPress={onShare} style={styles.linkButton}>
          <Text style={styles.linkButtonText}>{tertiaryShare}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    ...theme.shadow.card,
  },
  metaRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  metaPill: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceAlt,
  },
  metaText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.meta,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.display,
    fontWeight: '700',
    lineHeight: 40,
  },
  action: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    lineHeight: 24,
  },
  copyBlock: {
    gap: 6,
  },
  label: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.meta,
    fontWeight: '700',
    letterSpacing: 1,
  },
  body: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  primaryButton: {
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.accent,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#1b1202',
    fontSize: theme.typography.body,
    fontWeight: '800',
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceAlt,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  linkButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  linkButtonText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    fontWeight: '600',
  },
});
