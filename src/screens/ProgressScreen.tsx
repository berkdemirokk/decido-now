import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { UiCopy } from '../lib/uiCopy';
import { DecisionRecord, InsightCard, SupportedLanguage } from '../types';

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
  dnaCards,
  dnaLockedCount,
  recent,
  progressSummary,
  behaviorProfile,
  onPaywall,
}: ProgressScreenProps) {
  const tacticalInsight = progressSummary.insights[0];
  const deepInsight = dnaCards[0];
  const identityLine = copy.progress.identityLine(behaviorProfile.executionScore);

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>{directionLabel}</Text>
        <Text style={styles.title}>{behaviorProfile.identityTitle}</Text>
        <Text style={styles.heroBody}>{identityLine}</Text>
      </View>

      <View style={styles.scoreBlock}>
        <ScoreColumn label={copy.progress.execution} value={behaviorProfile.executionScore} />
        <ScoreColumn label={copy.progress.stability} value={behaviorProfile.stabilityScore} />
        <ScoreColumn label={copy.progress.drift} value={behaviorProfile.driftScore} negative />
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

function ScoreColumn({
  label,
  value,
  negative = false,
}: {
  label: string;
  value: number;
  negative?: boolean;
}) {
  return (
    <View style={styles.scoreColumn}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <Text style={[styles.scoreValue, negative ? styles.scoreValueNegative : null]}>{value}</Text>
    </View>
  );
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
    backgroundColor: '#0B0B0F',
  },
  hero: {
    gap: 10,
  },
  eyebrow: {
    color: 'rgba(255,255,255,0.48)',
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    fontFamily: 'Inter_700Bold',
    letterSpacing: -1,
  },
  heroBody: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
    maxWidth: 320,
  },
  scoreBlock: {
    borderRadius: 20,
    backgroundColor: '#15151C',
    paddingHorizontal: 20,
    paddingVertical: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  scoreColumn: {
    flex: 1,
    gap: 6,
  },
  scoreLabel: {
    color: 'rgba(255,255,255,0.52)',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  scoreValue: {
    color: '#FFFFFF',
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '800',
    fontFamily: 'Inter_700Bold',
    letterSpacing: -1,
  },
  scoreValueNegative: {
    color: 'rgba(255,255,255,0.78)',
  },
  adjustmentBlock: {
    gap: 10,
  },
  sectionLabel: {
    color: 'rgba(255,255,255,0.44)',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1,
  },
  adjustmentTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  adjustmentBody: {
    color: 'rgba(255,255,255,0.68)',
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
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingTop: 18,
  },
  supportLabel: {
    color: 'rgba(255,255,255,0.42)',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1,
  },
  supportTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  supportBody: {
    color: 'rgba(255,255,255,0.58)',
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
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingTop: 14,
  },
  moveTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  moveDate: {
    color: 'rgba(255,255,255,0.48)',
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
});
