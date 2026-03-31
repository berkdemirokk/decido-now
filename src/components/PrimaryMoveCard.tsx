import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Suggestion } from '../types';
import { theme } from '../theme';

interface PrimaryMoveCardProps {
  move: Suggestion;
  kickerLabel: string;
  reason: string;
  todayGain: string;
  tomorrowGain: string;
  commitLabel: string;
  commitBody: string;
  whyLabel: string;
  todayLabel: string;
  tomorrowLabel: string;
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
  kickerLabel,
  reason,
  todayGain,
  tomorrowGain,
  commitLabel,
  commitBody,
  whyLabel,
  todayLabel,
  tomorrowLabel,
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
      <View style={styles.topAccent} />

      <View style={styles.metaRow}>
        <MetaChip label={streakLabel} />
        <MetaChip label={levelLabel} />
      </View>

      <View style={styles.heroBlock}>
        <Text style={styles.kicker}>{kickerLabel}</Text>
        <Text style={styles.title}>{move.title}</Text>
        <Text style={styles.action}>{move.action}</Text>
      </View>

      <View style={styles.commitFrame}>
        <Text style={styles.commitLabel}>{commitLabel}</Text>
        <Text style={styles.commitBody}>{commitBody}</Text>
      </View>

      <View style={styles.signalCard}>
        <Text style={styles.signalLabel}>{whyLabel}</Text>
        <Text style={styles.signalBody}>{reason}</Text>
      </View>

      <View style={styles.splitRow}>
        <MiniPanel label={todayLabel} body={todayGain} emphasize />
        <MiniPanel label={tomorrowLabel} body={tomorrowGain} />
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

      <View style={styles.tertiaryRow}>
        <Pressable onPress={onRefine} style={styles.tertiaryButton}>
          <Text style={styles.tertiaryText}>{tertiaryRefine}</Text>
        </Pressable>
        <Pressable onPress={onShare} style={styles.tertiaryButton}>
          <Text style={styles.tertiaryText}>{tertiaryShare}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function MetaChip({ label }: { label: string }) {
  return (
    <View style={styles.metaChip}>
      <Text style={styles.metaText}>{label}</Text>
    </View>
  );
}

function MiniPanel({
  label,
  body,
  emphasize = false,
}: {
  label: string;
  body: string;
  emphasize?: boolean;
}) {
  return (
    <View style={[styles.miniPanel, emphasize ? styles.miniPanelStrong : null]}>
      <Text style={styles.panelLabel}>{label}</Text>
      <Text style={[styles.panelBody, emphasize ? styles.panelBodyStrong : null]}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    padding: theme.spacing.xl,
    gap: theme.spacing.lg,
    overflow: 'hidden',
    ...theme.shadow.card,
  },
  topAccent: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 5,
    backgroundColor: theme.colors.accent,
  },
  metaRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  metaChip: {
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceAlt,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  metaText: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.meta,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  heroBlock: {
    gap: theme.spacing.sm,
  },
  kicker: {
    color: theme.colors.accent,
    fontSize: theme.typography.meta,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.display,
    lineHeight: 46,
    fontWeight: '700',
    letterSpacing: -1.1,
  },
  action: {
    color: theme.colors.textMuted,
    fontSize: 17,
    lineHeight: 26,
  },
  commitFrame: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(212,162,76,0.28)',
    backgroundColor: 'rgba(212,162,76,0.08)',
    padding: theme.spacing.md,
    gap: 8,
    ...theme.shadow.gold,
  },
  commitLabel: {
    color: theme.colors.accent,
    fontSize: theme.typography.meta,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  commitBody: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    lineHeight: 22,
    fontWeight: '600',
  },
  signalCard: {
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  signalLabel: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.meta,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  signalBody: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    lineHeight: 23,
  },
  splitRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  miniPanel: {
    flex: 1,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    gap: 8,
  },
  miniPanelStrong: {
    borderColor: 'rgba(212,162,76,0.22)',
    backgroundColor: 'rgba(212,162,76,0.06)',
  },
  panelLabel: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.meta,
    fontWeight: '800',
    letterSpacing: 1,
  },
  panelBody: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  panelBodyStrong: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  primaryButton: {
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.accent,
    paddingVertical: 19,
    alignItems: 'center',
    ...theme.shadow.gold,
  },
  primaryButtonText: {
    color: '#130d04',
    fontSize: theme.typography.body,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceAlt,
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  tertiaryRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  tertiaryButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tertiaryText: {
    color: theme.colors.textSoft,
    fontSize: 15,
    fontWeight: '700',
  },
});
