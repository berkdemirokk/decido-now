import { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { DNAInsightCard } from '../components/DNAInsightCard';
import { DecisionRecord, InsightCard } from '../types';
import { UiCopy } from '../lib/uiCopy';
import { theme } from '../theme';

interface ProgressScreenProps {
  copy: UiCopy;
  streak: number;
  level: string;
  xp: number;
  momentumLine: string;
  weeklySummaryTitle: string;
  weeklySummaryBody: string;
  dnaCards: InsightCard[];
  dnaLockedCount: number;
  pending: DecisionRecord[];
  recent: DecisionRecord[];
  analyticsSummary: {
    sessions: number;
    completedMoves: number;
    paywallViews: number;
    purchaseAttempts: number;
    purchaseSuccess: number;
    shares: number;
    gifts: number;
    retentionDays: number;
  };
  onPaywall: () => void;
  onShare: (record: DecisionRecord) => void;
}

export function ProgressScreen({
  copy,
  streak,
  level,
  xp,
  momentumLine,
  weeklySummaryTitle,
  weeklySummaryBody,
  dnaCards,
  dnaLockedCount,
  pending,
  recent,
  analyticsSummary,
  onPaywall,
  onShare,
}: ProgressScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>{copy.progress.title}</Text>

      <View style={styles.hero}>
        <Metric label={copy.progress.momentum} value={`${streak}`} />
        <Metric label={copy.reward.level} value={level} />
        <Metric label="XP" value={`${xp}`} />
      </View>

      <Section title={copy.progress.wins}>
        <Text style={styles.sectionTitle}>{weeklySummaryTitle}</Text>
        <Text style={styles.body}>{weeklySummaryBody}</Text>
        <Text style={styles.footnote}>{momentumLine}</Text>
      </Section>

      <Section title="Retention">
        <View style={styles.analyticsGrid}>
          <Metric label="Sessions" value={`${analyticsSummary.sessions}`} />
          <Metric label="Days back" value={`${analyticsSummary.retentionDays}`} />
          <Metric label="Paywalls" value={`${analyticsSummary.paywallViews}`} />
          <Metric label="Purchases" value={`${analyticsSummary.purchaseSuccess}/${analyticsSummary.purchaseAttempts}`} />
        </View>
        <Text style={styles.body}>
          {`Shares ${analyticsSummary.shares} • Gifts ${analyticsSummary.gifts} • Completed ${analyticsSummary.completedMoves}`}
        </Text>
      </Section>

      <Section title={copy.progress.pattern}>
        {dnaCards.map((card) => (
          <DNAInsightCard key={card.id} {...card} />
        ))}
        {dnaLockedCount > 0 ? (
          <DNAInsightCard
            eyebrow="PRO"
            title="Locked insight"
            body="Upgrade to reveal this pattern."
            metric={`${dnaLockedCount} locked`}
            locked
            onPress={onPaywall}
          />
        ) : null}
      </Section>

      <Section title={copy.progress.pending}>
        {pending.length ? (
          pending.map((record) => (
            <View key={record.id} style={styles.recordCard}>
              <Text style={styles.recordTitle}>{record.selectedSuggestion.title}</Text>
              <Text style={styles.body}>{copy.states.scoreNow}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.body}>{copy.progress.empty}</Text>
        )}
      </Section>

      <Section title={copy.progress.recent}>
        {recent.map((record) => (
          <View key={record.id} style={styles.recordCard}>
            <View style={styles.recordHeader}>
              <Text style={styles.recordTitle}>{record.selectedSuggestion.title}</Text>
              <Text style={styles.recordScore}>{record.resultScore ?? '-'}/5</Text>
            </View>
            <Text style={styles.body}>{record.selectedSuggestion.action}</Text>
            <Text style={styles.shareLink} onPress={() => onShare(record)}>
              {copy.progress.shareWin}
            </Text>
          </View>
        ))}
      </Section>
    </ScrollView>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
    paddingBottom: 140,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.display,
    fontWeight: '700',
  },
  hero: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  metric: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: 4,
  },
  metricLabel: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.meta,
    fontWeight: '700',
    letterSpacing: 1,
  },
  metricValue: {
    color: theme.colors.text,
    fontSize: theme.typography.h2,
    fontWeight: '700',
  },
  section: {
    gap: theme.spacing.sm,
  },
  sectionLabel: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.meta,
    fontWeight: '700',
    letterSpacing: 1,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.h2,
    fontWeight: '700',
  },
  body: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  footnote: {
    color: theme.colors.accent,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  recordCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  recordTitle: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  recordScore: {
    color: theme.colors.accent,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  shareLink: {
    color: theme.colors.accent,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
});
