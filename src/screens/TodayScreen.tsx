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
  phaseLabel: string;
  movesLeftLabel: string;
  swapsLeftLabel: string;
  premiumTease: string;
  reason: string;
  todayGain: string;
  tomorrowGain: string;
  tonightLine: string;
  streakLabel: string;
  levelLabel: string;
  executionScore: number;
  stabilityScore: number;
  driftScore: number;
  momentumTitle: string;
  momentumBody: string;
  lossLine: string | null;
  returnPull: string;
  recoveryPrompt: {
    title: string;
    body: string;
    cta: string;
    premiumProtected: boolean;
    source?: 'abandon' | 'missed-day' | 'swap-fatigue';
  } | null;
  streakSaverEligible: boolean;
  streakFreezeCredits: number;
  onStart: () => void;
  onWhy: () => void;
  onSwap: () => void;
  onRefine: () => void;
  onShare: () => void;
  onRecovery: () => void;
  onStreakSaver: () => void;
}

export function TodayScreen({
  copy,
  move,
  contextLabel,
  personaTitle,
  personaAuditLine,
  phaseLabel,
  movesLeftLabel,
  swapsLeftLabel,
  premiumTease,
  reason,
  todayGain,
  tomorrowGain,
  tonightLine,
  streakLabel,
  levelLabel,
  executionScore,
  stabilityScore,
  driftScore,
  momentumTitle,
  momentumBody,
  lossLine,
  returnPull,
  recoveryPrompt,
  streakSaverEligible,
  streakFreezeCredits,
  onStart,
  onWhy,
  onSwap,
  onRefine,
  onShare,
  onRecovery,
  onStreakSaver,
}: TodayScreenProps) {
  const isTurkish = copy.tabs.today === 'Bugun';

  if (!move) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>{copy.today.noMove}</Text>
        <Text style={styles.emptyBody}>{copy.today.usageHint}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.heroBlock}>
        <Text style={styles.eyebrow}>{copy.today.eyebrow}</Text>
        <Text style={styles.title}>{copy.today.title}</Text>
        <View style={styles.contextRow}>
          <Text style={styles.contextText}>{contextLabel}</Text>
          {personaTitle ? (
            <>
              <Text style={styles.contextDivider}>/</Text>
              <Text style={styles.contextText}>{personaTitle}</Text>
            </>
          ) : null}
        </View>
        {personaAuditLine ? <Text style={styles.auditLine}>{personaAuditLine}</Text> : null}
        <View style={styles.stateRow}>
          <StatePill label={phaseLabel} />
          <StatePill label={movesLeftLabel} />
          <StatePill label={swapsLeftLabel} />
        </View>
      </View>

      <PrimaryMoveCard
        move={move}
        kickerLabel={copy.today.moveLabel}
        reason={reason}
        todayGain={todayGain}
        tomorrowGain={tomorrowGain}
        commitLabel={copy.today.commitLabel}
        commitBody={copy.today.commitBody}
        whyLabel={copy.guidance.whyFits}
        todayLabel={copy.today.todayGain}
        tomorrowLabel={copy.today.tomorrowGain}
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

      <View style={styles.signalGrid}>
        <View style={styles.signalCardPrimary}>
          <Text style={styles.signalLabel}>{isTurkish ? 'MOMENTUM' : 'MOMENTUM'}</Text>
          <Text style={styles.signalTitle}>{momentumTitle}</Text>
          <Text style={styles.signalBody}>{momentumBody}</Text>
          <View style={styles.metricRow}>
            <ControlMetric label="EXE" value={executionScore} tone="strong" />
            <ControlMetric
              label={isTurkish ? 'IST' : 'STB'}
              value={stabilityScore}
            />
            <ControlMetric label="DRF" value={driftScore} tone="danger" />
          </View>
          {lossLine ? <Text style={styles.lossLine}>{lossLine}</Text> : null}
        </View>

        <View style={styles.signalCard}>
          <Text style={styles.signalLabel}>{copy.today.tonight}</Text>
          <Text style={styles.signalBody}>{tonightLine}</Text>
          <Text style={styles.returnPull}>{returnPull}</Text>
          <Text style={styles.usageHint}>{premiumTease}</Text>
        </View>
      </View>

      {recoveryPrompt ? (
        <Pressable style={styles.recoveryCard} onPress={onRecovery}>
          <Text style={styles.recoveryLabel}>
            {recoveryPrompt.source === 'swap-fatigue'
              ? isTurkish
                ? 'KARAR RESETI'
                : 'DECISION RESET'
              : isTurkish
                ? 'HIZLI TOPARLANMA'
                : 'QUICK RECOVERY'}
          </Text>
          <Text style={styles.recoveryTitle}>{recoveryPrompt.title}</Text>
          <Text style={styles.recoveryBody}>{recoveryPrompt.body}</Text>
          <Text style={styles.recoveryCta}>
            {recoveryPrompt.cta}
            {recoveryPrompt.premiumProtected
              ? isTurkish
                ? ' (Seri koruma hazir)'
                : ' (Streak protection ready)'
              : ''}
          </Text>
        </Pressable>
      ) : null}

      {streakSaverEligible ? (
        <Pressable style={styles.saverCard} onPress={onStreakSaver}>
          <Text style={styles.saverLabel}>{isTurkish ? 'SERI KORUMA' : 'STREAK SAVER'}</Text>
          <Text style={styles.saverTitle}>
            {isTurkish ? 'Bugunu kaybetme.' : 'Do not lose the day.'}
          </Text>
          <Text style={styles.saverBody}>{copy.helpers.streakSaverBody(streakFreezeCredits)}</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

function StatePill({ label }: { label: string }) {
  return (
    <View style={styles.statePill}>
      <Text style={styles.statePillText}>{label}</Text>
    </View>
  );
}

function ControlMetric({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: number;
  tone?: 'default' | 'strong' | 'danger';
}) {
  return (
    <View style={styles.metricChip}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text
        style={[
          styles.metricValue,
          tone === 'strong' ? styles.metricValueStrong : null,
          tone === 'danger' ? styles.metricValueDanger : null,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
    paddingBottom: 140,
    flexGrow: 1,
  },
  heroBlock: {
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
  },
  eyebrow: {
    color: theme.colors.accent,
    fontSize: theme.typography.meta,
    fontWeight: '800',
    letterSpacing: 1.6,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.display,
    fontWeight: '700',
    lineHeight: 46,
    letterSpacing: -1,
  },
  contextRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  contextText: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.meta,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  contextDivider: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.meta,
    opacity: 0.5,
  },
  auditLine: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 23,
  },
  stateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statePill: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statePillText: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.meta,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  signalGrid: {
    gap: theme.spacing.sm,
  },
  signalCardPrimary: {
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  signalCard: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  signalLabel: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.meta,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  signalTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.h2,
    fontWeight: '700',
  },
  signalBody: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  metricRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  metricChip: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    gap: 4,
  },
  metricLabel: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.meta,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  metricValue: {
    color: theme.colors.text,
    fontSize: theme.typography.h2,
    fontWeight: '800',
  },
  metricValueStrong: {
    color: theme.colors.accent,
  },
  metricValueDanger: {
    color: theme.colors.danger,
  },
  lossLine: {
    color: theme.colors.danger,
    fontSize: theme.typography.body,
    lineHeight: 22,
    fontWeight: '600',
  },
  returnPull: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    lineHeight: 22,
    fontWeight: '600',
  },
  usageHint: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  recoveryCard: {
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  recoveryLabel: {
    color: theme.colors.accent,
    fontSize: theme.typography.meta,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  recoveryTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.h2,
    fontWeight: '700',
  },
  recoveryBody: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  recoveryCta: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  saverCard: {
    backgroundColor: 'rgba(212,162,76,0.08)',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(212,162,76,0.24)',
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
    lineHeight: 22,
  },
});

