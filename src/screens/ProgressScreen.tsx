import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { UiCopy } from '../lib/uiCopy';
import { DecisionRecord, InsightCard, SupportedLanguage } from '../types';
import { theme } from '../theme';

interface ProgressScreenProps {
  copy: UiCopy;
  language: SupportedLanguage;
  streak: number;
  level: string;
  xp: number;
  momentumLine: string;
  directionLabel: string;
  weeklyBlueprint: {
    eyebrow: string;
    title: string;
    summary: string;
    progressLine: string;
    whyToday: string;
  };
  weeklySummaryTitle: string;
  weeklySummaryBody: string;
  dnaCards: InsightCard[];
  dnaLockedCount: number;
  pending: DecisionRecord[];
  recent: DecisionRecord[];
  analyticsSummary: {
    recoveryPromptsSeen: number;
    recoveryAccepted: number;
    streakSaverUsed: number;
  };
  progressSummary: {
    completionRate: number;
    recoveryRate: number;
    completedThisWeek: number;
    resetsThisWeek: number;
    bestWindow: string;
    nextAdjustmentTitle: string;
    nextAdjustmentBody: string;
    insights: Array<{
      id: string;
      title: string;
      body: string;
      metric: string;
      premium?: boolean;
    }>;
  };
  behaviorProfile: {
    executionScore: number;
    stabilityScore: number;
    driftScore: number;
    momentumTitle: string;
    momentumBody: string;
    identityTitle: string;
    identityBody: string;
    lossLine: string | null;
    returnPull: string;
  };
  onPaywall: () => void;
  onShare: (record: DecisionRecord) => void;
}

export function ProgressScreen({
  copy,
  language,
  directionLabel,
  momentumLine,
  dnaCards,
  dnaLockedCount,
  recent,
  progressSummary,
  behaviorProfile,
  onPaywall,
}: ProgressScreenProps) {
  const tacticalInsight = progressSummary.insights[0];
  const deepInsight = dnaCards[0];
  const signalLabels = getSignalLabels(language);
  const signalRows = [
    {
      label: signalLabels.consistency,
      value: `${progressSummary.completionRate}%`,
      hint: signalLabels.closeRate,
    },
    {
      label: signalLabels.accumulation,
      value: `${progressSummary.completedThisWeek}`,
      hint: signalLabels.movesThisWeek,
    },
    {
      label: signalLabels.improvement,
      value: progressSummary.bestWindow,
      hint: signalLabels.bestWindow,
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>{directionLabel}</Text>
        <Text style={styles.title}>{behaviorProfile.identityTitle}</Text>
        <Text style={styles.heroBody}>{momentumLine}</Text>
      </View>

      <View style={styles.scoreBlock}>
        {signalRows.map((signal) => (
          <SignalColumn
            key={signal.label}
            label={signal.label}
            value={signal.value}
            hint={signal.hint}
          />
        ))}
      </View>

      <View style={styles.adjustmentBlock}>
        <Text style={styles.sectionLabel}>{copy.progress.adjustmentLabel}</Text>
        <Text style={styles.adjustmentTitle}>{progressSummary.nextAdjustmentTitle}</Text>
        <Text style={styles.adjustmentBody}>
          {tacticalInsight?.body ?? progressSummary.nextAdjustmentBody}
        </Text>
      </View>

      {deepInsight ? (
        dnaLockedCount > 0 ? (
          <Pressable style={styles.supportRow} onPress={onPaywall}>
            <Text style={styles.supportLabel}>{copy.progress.deeperReadLabel}</Text>
            <Text style={styles.supportTitle}>{copy.progress.deeperRead}</Text>
            <Text style={styles.supportBody}>{copy.progress.deeperReadBody}</Text>
          </Pressable>
        ) : (
          <View style={styles.supportRow}>
            <Text style={styles.supportLabel}>{copy.progress.deeperReadLabel}</Text>
            <Text style={styles.supportTitle}>{deepInsight.title}</Text>
            <Text style={styles.supportBody}>{deepInsight.body}</Text>
          </View>
        )
      ) : null}

      <View style={styles.supportSection}>
        <Text style={styles.sectionLabel}>{copy.progress.recentLabel}</Text>
        {recent.length ? (
          recent.slice(0, 4).map((record) => (
            <View key={record.id} style={styles.moveRow}>
              <Text style={styles.moveTitle}>{record.selectedSuggestion.title}</Text>
              <Text style={styles.moveDate}>{formatMoveDate(record, language)}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.supportBody}>{copy.progress.firstCloseBody}</Text>
        )}
      </View>
    </ScrollView>
  );
}

function SignalColumn({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <View style={styles.scoreColumn}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <Text style={styles.scoreValue}>{value}</Text>
      <Text style={styles.scoreHint}>{hint}</Text>
    </View>
  );
}

function getSignalLabels(language: SupportedLanguage) {
  if (language === 'tr') {
    return {
      consistency: 'Tutarlılık',
      accumulation: 'Birikim',
      improvement: 'İyileşme',
      closeRate: 'kapanış oranı',
      movesThisWeek: 'bu hafta',
      bestWindow: 'en temiz pencere',
    };
  }

  return {
    consistency: 'Consistency',
    accumulation: 'Accumulation',
    improvement: 'Improvement',
    closeRate: 'close rate',
    movesThisWeek: 'this week',
    bestWindow: 'best window',
  };
}

function formatMoveDate(record: DecisionRecord, language: SupportedLanguage) {
  const date = record.createdAt ? new Date(record.createdAt) : new Date(record.dateKey);
  return date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
    day: 'numeric',
    month: 'short',
  });
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 132,
    gap: 28,
    backgroundColor: theme.colors.background,
  },
  hero: {
    gap: 10,
  },
  eyebrow: {
    color: theme.colors.textSoft,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    color: theme.colors.text,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    fontFamily: 'Inter_700Bold',
    letterSpacing: -1,
  },
  heroBody: {
    color: theme.colors.textMuted,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
    maxWidth: 320,
  },
  scoreBlock: {
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  scoreColumn: {
    flex: 1,
    gap: 6,
  },
  scoreLabel: {
    color: theme.colors.textSoft,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  scoreValue: {
    color: theme.colors.text,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '800',
    fontFamily: 'Inter_700Bold',
    letterSpacing: -1,
  },
  scoreHint: {
    color: theme.colors.textSoft,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  adjustmentBlock: {
    gap: 10,
  },
  sectionLabel: {
    color: theme.colors.textSoft,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1,
  },
  adjustmentTitle: {
    color: theme.colors.text,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  adjustmentBody: {
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
    maxWidth: 340,
  },
  supportSection: {
    gap: 12,
    paddingTop: 4,
  },
  supportRow: {
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
    paddingTop: 18,
  },
  supportLabel: {
    color: theme.colors.textSoft,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1,
  },
  supportTitle: {
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  supportBody: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  moveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
    paddingTop: 14,
  },
  moveTitle: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  moveDate: {
    color: theme.colors.textSoft,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
});
