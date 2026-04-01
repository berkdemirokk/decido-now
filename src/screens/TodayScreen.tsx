import { StyleSheet, Text, View } from 'react-native';

import { PrimaryMoveCard } from '../components/PrimaryMoveCard';
import { UiCopy } from '../lib/uiCopy';
import { GrowthDirectionId, Suggestion, SupportedLanguage } from '../types';

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
  move,
  activeDirection,
  movesLeftLabel,
  reason,
  onStart,
  onWhy,
  onSwap,
}: TodayScreenProps) {
  const directionLine = copy.today.directionLine;
  const taskText = move?.action ?? copy.today.loadingMove;
  const shortReason = compressReason(reason?.trim() || move?.reason || '', copy.today.defaultShortReason);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>{copy.today.screenTitle}</Text>
        <Text style={styles.subtitle}>{copy.today.screenSubtitle}</Text>
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
          cardTitle={directionLine}
          whyLabel=""
          impactLabel=""
          reason={shortReason}
          todayGain=""
          tomorrowGain=""
          primaryCta={copy.today.primaryCtaShort}
          secondaryWhy=""
          secondarySwap=""
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0B0B0F',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 112,
    justifyContent: 'space-between',
  },
  header: {
    gap: 6,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 42,
    lineHeight: 48,
    fontWeight: '800',
    fontFamily: 'Inter_700Bold',
    letterSpacing: -1.4,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
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
    color: 'rgba(255,255,255,0.42)',
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
