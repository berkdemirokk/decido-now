import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PrimaryMoveCard } from '../components/PrimaryMoveCard';
import { UiCopy } from '../lib/uiCopy';
import { Suggestion } from '../types';
import { theme } from '../theme';

interface TodayScreenProps {
  copy: UiCopy;
  move: Suggestion | null;
  contextLabel: string;
  personaTitle: string | null;
  personaAuditLine: string | null;
  reason: string;
  todayGain: string;
  tomorrowGain: string;
  tonightLine: string;
  streakLabel: string;
  levelLabel: string;
  streakSaverEligible: boolean;
  streakFreezeCredits: number;
  onStart: () => void;
  onWhy: () => void;
  onSwap: () => void;
  onRefine: () => void;
  onShare: () => void;
  onStreakSaver: () => void;
}

export function TodayScreen({
  copy,
  move,
  contextLabel,
  personaTitle,
  personaAuditLine,
  reason,
  todayGain,
  tomorrowGain,
  tonightLine,
  streakLabel,
  levelLabel,
  streakSaverEligible,
  streakFreezeCredits,
  onStart,
  onWhy,
  onSwap,
  onRefine,
  onShare,
  onStreakSaver,
}: TodayScreenProps) {
  if (!move) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>{copy.today.noMove}</Text>
        <Text style={styles.emptyBody}>{copy.today.title}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.eyebrow}>{copy.today.eyebrow}</Text>
      <Text style={styles.title}>{copy.today.title}</Text>
      <View style={styles.contextRow}>
        <View style={styles.contextPill}>
          <Text style={styles.contextText}>{contextLabel}</Text>
        </View>
        {personaTitle ? (
          <View style={styles.contextPill}>
            <Text style={styles.contextText}>{personaTitle}</Text>
          </View>
        ) : null}
      </View>
      {personaAuditLine ? <Text style={styles.auditLine}>{personaAuditLine}</Text> : null}
      <PrimaryMoveCard
        move={move}
        reason={reason}
        todayGain={todayGain}
        tomorrowGain={tomorrowGain}
        streakLabel={streakLabel}
        levelLabel={levelLabel}
        primaryCta={copy.today.start}
        secondaryWhy={copy.today.why}
        secondarySwap={copy.today.swap}
        tertiaryRefine={copy.today.refine}
        tertiaryShare={copy.today.share}
        onStart={onStart}
        onWhy={onWhy}
        onSwap={onSwap}
        onRefine={onRefine}
        onShare={onShare}
      />
      <View style={styles.tonight}>
        <Text style={styles.tonightLabel}>{copy.today.tonight}</Text>
        <Text style={styles.tonightBody}>{tonightLine}</Text>
      </View>
      {streakSaverEligible ? (
        <Pressable style={styles.saverCard} onPress={onStreakSaver}>
          <Text style={styles.saverLabel}>STREAK SAVER</Text>
          <Text style={styles.saverTitle}>Save your momentum with a 2-minute reset.</Text>
          <Text style={styles.saverBody}>
            {streakFreezeCredits} freeze credit ready. Run the quick reset before tonight.
          </Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
    paddingBottom: 140,
  },
  eyebrow: {
    color: theme.colors.accent,
    fontSize: theme.typography.meta,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.display,
    fontWeight: '700',
    lineHeight: 40,
  },
  contextRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  contextPill: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  contextText: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.meta,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  auditLine: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  tonight: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  tonightLabel: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.meta,
    fontWeight: '700',
    letterSpacing: 1,
  },
  tonightBody: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  saverCard: {
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.28)',
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  saverLabel: {
    color: theme.colors.accent,
    fontSize: theme.typography.meta,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  saverTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.h2,
    fontWeight: '700',
  },
  saverBody: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  empty: {
    flex: 1,
    padding: theme.spacing.xl,
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.h1,
    fontWeight: '700',
  },
  emptyBody: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
  },
});
