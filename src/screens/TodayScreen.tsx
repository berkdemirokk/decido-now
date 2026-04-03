import { StyleSheet, Text, View } from 'react-native';

import { PrimaryMoveCard } from '../components/PrimaryMoveCard';
import { UiCopy } from '../lib/uiCopy';
import { GrowthDirectionId, Suggestion, SupportedLanguage } from '../types';
import { theme } from '../theme';

interface TodayScreenProps {
  copy: UiCopy;
  language: SupportedLanguage;
  move: Suggestion | null;
  activeDirection: {
    id: GrowthDirectionId;
    label: string;
    accent: string;
    promise: string;
  };
  directionOptions: Array<{
    id: GrowthDirectionId;
    label: string;
    accent: string;
    active: boolean;
    promise: string;
  }>;
  weeklyBlueprint: {
    eyebrow: string;
    title: string;
    summary: string;
    progressLine: string;
    whyToday: string;
  };
  phaseLabel: string;
  movesLeftLabel: string;
  swapsLeftLabel: string;
  streakLabel: string;
  reason: string;
  todayGain: string;
  tomorrowGain: string;
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
  onRecovery: () => void;
  onStreakSaver: () => void;
  onSelectDirection: (directionId: GrowthDirectionId) => void;
  onToggleLanguage: () => void;
}

export function TodayScreen({
  copy,
  language,
  move,
  activeDirection,
  weeklyBlueprint,
  movesLeftLabel,
  streakLabel,
  reason,
  todayGain,
  tomorrowGain,
  onStart,
  onWhy,
  onSwap,
}: TodayScreenProps) {
  const directionLine = copy.today.directionLine;
  const taskText = move?.action ?? copy.today.loadingMove;
  const shortReason = compressReason(
    reason?.trim() || move?.reason || '',
    copy.today.defaultShortReason
  );
  const momentumLine = buildCardMomentumLine(streakLabel, language);
  const continuationLine = buildContinuationLine(
    tomorrowGain,
    weeklyBlueprint.progressLine,
    language
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>{copy.today.screenTitle}</Text>
        <Text style={styles.subtitle}>{copy.today.screenSubtitle}</Text>
        {continuationLine ? (
          <Text style={styles.continuationLine}>{continuationLine}</Text>
        ) : null}
      </View>

      <View style={styles.cardWrap}>
        <PrimaryMoveCard
          move={
            move ?? {
              id: 'empty-state',
              title: directionLine,
              action: taskText,
              reason: shortReason,
              category: 'focus',
              preferredModes: ['quick-win'],
              energies: ['mid'],
              minutes: 5,
              budget: ['free'],
            }
          }
          accentColor={activeDirection.accent}
          directionLabel={activeDirection.label}
          momentumLine={momentumLine}
          cardTitle={directionLine}
          whyLabel=""
          impactLabel=""
          reason={shortReason}
          todayGain={todayGain}
          tomorrowGain={tomorrowGain}
          primaryCta={copy.today.primaryCtaShort}
          secondaryWhy={copy.today.why}
          secondarySwap={copy.today.swap}
          onStart={onStart}
          onWhy={onWhy}
          onSwap={onSwap}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{movesLeftLabel}</Text>
      </View>
    </View>
  );
}

function buildCardMomentumLine(streakLabel: string, language: SupportedLanguage) {
  const streak = Number.parseInt(streakLabel, 10);

  if (!Number.isFinite(streak) || streak <= 0) {
    return null;
  }

  if (language === 'tr') {
    return streak >= 3 ? `${streak} gündür içindesin` : 'Bugün de koparma';
  }

  return streak >= 3 ? `You're ${streak} days in` : "Don't break it now";
}

function buildContinuationLine(
  tomorrowGain: string,
  progressLine: string,
  language: SupportedLanguage
) {
  const source = tomorrowGain.trim() || progressLine.trim();

  if (source) {
    const firstChunk = source.split(/[.!?]/)[0]?.trim() ?? source;
    return firstChunk.length <= 42
      ? firstChunk
      : `${firstChunk.slice(0, 39).trimEnd()}...`;
  }

  return language === 'tr'
    ? 'Dün bıraktığın yerin üstüne gidiyorsun'
    : "You're picking up where you left off";
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 112,
    justifyContent: 'space-between',
  },
  header: {
    gap: 6,
  },
  title: {
    color: theme.colors.text,
    fontSize: 42,
    lineHeight: 48,
    fontWeight: '800',
    fontFamily: 'Inter_700Bold',
    letterSpacing: -1.4,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  continuationLine: {
    color: theme.colors.accent,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    maxWidth: 300,
  },
  cardWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 12,
    paddingBottom: 12,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  footerText: {
    color: theme.colors.textSoft,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
});

function compressReason(input: string, fallback: string) {
  const cleaned = input
    .replace(/^çünkü\s+/i, '')
    .replace(/^because\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) {
    return fallback;
  }

  const firstChunk = cleaned.split(/[.!?]/)[0]?.trim() ?? cleaned;
  if (firstChunk.length <= 28) return firstChunk;
  return `${firstChunk.slice(0, 25).trimEnd()}...`;
}
