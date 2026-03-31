import { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { DNAInsightCard } from '../components/DNAInsightCard';
import { UiCopy } from '../lib/uiCopy';
import { theme } from '../theme';
import { DecisionRecord, InsightCard } from '../types';

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
    onboardingCompleted: number;
    activationMovesShown: number;
    firstMovesStarted: number;
    completedMoves: number;
    completedFocusRuns: number;
    abandonedFocusRuns: number;
    paywallViews: number;
    softPaywallViews: number;
    hardPaywallViews: number;
    purchaseAttempts: number;
    purchaseSuccess: number;
    guidanceOpens: number;
    moveLimitHits: number;
    swapLimitHits: number;
    recoveryTriggered: number;
    recoveryCompleted: number;
    recoveryPromptsSeen: number;
    recoveryAccepted: number;
    streakSaverUsed: number;
    shares: number;
    shareVariantOpened: number;
    shareVariantUsed: number;
    gifts: number;
    retentionDays: number;
    notificationScheduled: number;
    rewardViews: number;
    ctaTaps: number;
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
  progressSummary,
  behaviorProfile,
  onPaywall,
  onShare,
}: ProgressScreenProps) {
  const isTurkish = copy.tabs.today === 'Bugun';

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>{copy.progress.controlPanel}</Text>
        <Text style={styles.title}>{copy.progress.title}</Text>
        <Text style={styles.heroBody}>{behaviorProfile.momentumBody}</Text>
        <View style={styles.heroMetrics}>
          <Metric label={copy.progress.momentum} value={`${streak}`} highlight />
          <Metric label={copy.reward.level} value={level} />
          <Metric label="XP" value={`${xp}`} />
          <Metric
            label={isTurkish ? 'Kapanis' : 'Close rate'}
            value={`${progressSummary.completionRate}%`}
          />
        </View>
        <View style={styles.statusBand}>
          <StatusMetric label="EXE" value={behaviorProfile.executionScore} tone="strong" />
          <StatusMetric
            label={isTurkish ? 'IST' : 'STB'}
            value={behaviorProfile.stabilityScore}
          />
          <StatusMetric label="DRF" value={behaviorProfile.driftScore} tone="danger" />
        </View>
        {behaviorProfile.lossLine ? <Text style={styles.lossLine}>{behaviorProfile.lossLine}</Text> : null}
        <Text style={styles.returnPull}>{behaviorProfile.returnPull}</Text>
      </View>

      <Panel title={copy.progress.nextAdjustment}>
        <Text style={styles.panelTitle}>{progressSummary.nextAdjustmentTitle}</Text>
        <Text style={styles.body}>{progressSummary.nextAdjustmentBody}</Text>
      </Panel>

      <Panel title={copy.progress.wins}>
        <Text style={styles.panelTitle}>{weeklySummaryTitle}</Text>
        <Text style={styles.body}>{weeklySummaryBody}</Text>
        <Text style={styles.goldLine}>{momentumLine}</Text>
      </Panel>

      <Panel title={isTurkish ? 'Kimlik kaymasi' : 'Identity shift'}>
        <Text style={styles.panelTitle}>{behaviorProfile.identityTitle}</Text>
        <Text style={styles.body}>{behaviorProfile.identityBody}</Text>
      </Panel>

      <Panel title={isTurkish ? 'Davranis sinyalleri' : 'Behavior signals'}>
        <View style={styles.signalGrid}>
          <Metric
            label={isTurkish ? 'Bu hafta' : 'This week'}
            value={`${progressSummary.completedThisWeek}`}
          />
          <Metric
            label={isTurkish ? 'Reset' : 'Resets'}
            value={`${progressSummary.resetsThisWeek}`}
          />
          <Metric
            label={isTurkish ? 'Toparlanma' : 'Recovery'}
            value={`${progressSummary.recoveryRate}%`}
          />
          <Metric
            label={isTurkish ? 'En iyi pencere' : 'Best window'}
            value={progressSummary.bestWindow}
          />
        </View>
        <Text style={styles.supportLine}>
          {isTurkish
            ? `Prompt ${analyticsSummary.recoveryPromptsSeen} | Kabul ${analyticsSummary.recoveryAccepted} | Seri koruma ${analyticsSummary.streakSaverUsed}`
            : `Prompts ${analyticsSummary.recoveryPromptsSeen} | Accepted ${analyticsSummary.recoveryAccepted} | Saver ${analyticsSummary.streakSaverUsed}`}
        </Text>
      </Panel>

      <Panel title={isTurkish ? 'Sistemin ogrendigi seyler' : 'What the system is learning'}>
        {progressSummary.insights.map((insight) => {
          if (insight.premium && dnaLockedCount > 0) {
            return (
              <DNAInsightCard
                key={insight.id}
                eyebrow="PRO"
                title={insight.title}
                body={insight.body}
                metric={isTurkish ? 'Pro gerektirir' : 'Requires Pro'}
                locked
                onPress={onPaywall}
              />
            );
          }

          return (
            <DNAInsightCard
              key={insight.id}
              eyebrow={insight.premium ? 'PRO' : 'PATTERN'}
              title={insight.title}
              body={insight.body}
              metric={insight.metric}
            />
          );
        })}
      </Panel>

      <Panel title={copy.progress.pattern}>
        {dnaCards.map((card) => (
          <DNAInsightCard key={card.id} {...card} />
        ))}
        {dnaLockedCount > 0 ? (
          <DNAInsightCard
            eyebrow="PRO"
            title={isTurkish ? 'Derin kalip kilitli' : 'Deep pattern locked'}
            body={
              isTurkish
                ? 'Bu yuzey Pro ile acilir. Daha derin DNA icgoruleri kaybi nerede verdigini gosterir.'
                : 'Pro reveals this layer. Deeper DNA insight shows exactly where momentum leaks.'
            }
            metric={isTurkish ? `${dnaLockedCount} kilitli` : `${dnaLockedCount} locked`}
            locked
            onPress={onPaywall}
          />
        ) : null}
      </Panel>

      <Panel title={isTurkish ? 'Kontrol sinyali' : 'Control signal'}>
        <View style={styles.signalGrid}>
          <Metric label={isTurkish ? 'Oturum' : 'Sessions'} value={`${analyticsSummary.sessions}`} />
          <Metric
            label={isTurkish ? 'Geri donus' : 'Days back'}
            value={`${analyticsSummary.retentionDays}`}
          />
          <Metric
            label={isTurkish ? 'Paywall' : 'Paywall'}
            value={`${analyticsSummary.softPaywallViews}/${analyticsSummary.hardPaywallViews}`}
          />
          <Metric
            label={isTurkish ? 'Bildirim' : 'Scheduled'}
            value={`${analyticsSummary.notificationScheduled}`}
          />
        </View>
        <Text style={styles.supportLine}>
          {isTurkish
            ? `Odul ${analyticsSummary.rewardViews} | CTA ${analyticsSummary.ctaTaps} | Rehberlik ${analyticsSummary.guidanceOpens}`
            : `Reward ${analyticsSummary.rewardViews} | CTA ${analyticsSummary.ctaTaps} | Guidance ${analyticsSummary.guidanceOpens}`}
        </Text>
      </Panel>

      <Panel title={copy.progress.pending}>
        {pending.length ? (
          pending.map((record) => (
            <View key={record.id} style={styles.recordCard}>
              <Text style={styles.recordTitle}>{record.selectedSuggestion.title}</Text>
              <Text style={styles.body}>
                {isTurkish ? 'Bu hamle hala skor bekliyor.' : 'This move is still waiting for a score.'}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.body}>{copy.progress.empty}</Text>
        )}
      </Panel>

      <Panel title={copy.progress.recent}>
        {recent.map((record) => (
          <View key={record.id} style={styles.recordCard}>
            <View style={styles.recordHeader}>
              <Text style={styles.recordTitle}>{record.selectedSuggestion.title}</Text>
              <Text style={styles.recordScore}>{record.resultScore ?? '-'}/5</Text>
            </View>
            <Text style={styles.body}>{record.selectedSuggestion.action}</Text>
            <Text style={styles.recordMeta}>
              {record.focusRunOutcome === 'abandoned'
                ? isTurkish
                  ? 'Yarida birakildi'
                  : 'Abandoned'
                : record.focusRunOutcome === 'partial'
                  ? isTurkish
                    ? 'Kismi tamamlandi'
                    : 'Partially closed'
                  : isTurkish
                    ? 'Temiz kapanis'
                    : 'Clean close'}
            </Text>
            <Text style={styles.shareLink} onPress={() => onShare(record)}>
              {copy.progress.shareWin}
            </Text>
          </View>
        ))}
      </Panel>
    </ScrollView>
  );
}

function Metric({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={[styles.metricCard, highlight ? styles.metricCardStrong : null]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, highlight ? styles.metricValueStrong : null]}>{value}</Text>
    </View>
  );
}

function StatusMetric({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: number;
  tone?: 'default' | 'strong' | 'danger';
}) {
  return (
    <View style={styles.statusMetric}>
      <Text style={styles.statusMetricLabel}>{label}</Text>
      <Text
        style={[
          styles.statusMetricValue,
          tone === 'strong' ? styles.statusMetricValueStrong : null,
          tone === 'danger' ? styles.statusMetricValueDanger : null,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.panel}>
      <Text style={styles.panelLabel}>{title}</Text>
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
  hero: {
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    ...theme.shadow.gold,
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
  },
  heroBody: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  heroMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  metricCard: {
    flex: 1,
    minWidth: 110,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    gap: 4,
  },
  metricCardStrong: {
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surfaceMuted,
  },
  metricLabel: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.meta,
    fontWeight: '700',
    letterSpacing: 0.9,
  },
  metricValue: {
    color: theme.colors.text,
    fontSize: theme.typography.h2,
    fontWeight: '800',
  },
  metricValueStrong: {
    color: theme.colors.accent,
  },
  statusBand: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  statusMetric: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    gap: 4,
  },
  statusMetricLabel: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.meta,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  statusMetricValue: {
    color: theme.colors.text,
    fontSize: theme.typography.h2,
    fontWeight: '800',
  },
  statusMetricValueStrong: {
    color: theme.colors.accent,
  },
  statusMetricValueDanger: {
    color: theme.colors.danger,
  },
  lossLine: {
    color: theme.colors.danger,
    fontSize: theme.typography.body,
    lineHeight: 22,
    fontWeight: '700',
  },
  returnPull: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    lineHeight: 22,
    fontWeight: '700',
  },
  panel: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  panelLabel: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.meta,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  panelTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.h2,
    fontWeight: '700',
  },
  body: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  goldLine: {
    color: theme.colors.accent,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  signalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  supportLine: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  recordCard: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
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
    fontWeight: '800',
  },
  recordMeta: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.label,
    fontWeight: '700',
  },
  shareLink: {
    color: theme.colors.accent,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
});
