import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Suggestion } from '../types';
import { theme } from '../theme';

interface PrimaryMoveCardProps {
  move: Suggestion;
  accentColor: string;
  directionLabel: string;
  momentumLine?: string | null;
  cardTitle?: string;
  whyLabel: string;
  impactLabel: string;
  reason: string;
  todayGain: string;
  tomorrowGain: string;
  primaryCta: string;
  secondaryWhy: string;
  secondarySwap: string;
  onStart: () => void;
  onWhy: () => void;
  onSwap: () => void;
}

export function PrimaryMoveCard({
  move,
  accentColor,
  directionLabel,
  cardTitle,
  momentumLine,
  reason,
  todayGain,
  primaryCta,
  secondaryWhy,
  secondarySwap,
  onStart,
  onWhy,
  onSwap,
}: PrimaryMoveCardProps) {
  const language = inferLanguage(move.action, reason, primaryCta, todayGain);
  const outcomePreview = buildOutcomePreview(language, todayGain, move.minutes);

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Text style={styles.cardTitle}>{cardTitle || move.title}</Text>
        <View
          style={[
            styles.directionPill,
            {
              borderColor: `${accentColor}33`,
              backgroundColor: `${accentColor}14`,
            },
          ]}
        >
          <Text style={[styles.directionText, { color: accentColor }]}>{directionLabel}</Text>
        </View>
      </View>

      <Text style={styles.taskText}>{move.action}</Text>

      <Text numberOfLines={1} style={styles.reasonText}>
        {reason}
      </Text>

      <Text numberOfLines={1} style={styles.outcomePreview}>
        {outcomePreview}
      </Text>

      {momentumLine ? (
        <Text numberOfLines={1} style={styles.momentumLine}>
          {momentumLine}
        </Text>
      ) : null}

      <View style={styles.actionsRow}>
        <Pressable hitSlop={8} onPress={onWhy} style={styles.secondaryAction}>
          <Text style={styles.secondaryActionText}>{secondaryWhy}</Text>
        </Pressable>
        <Pressable hitSlop={8} onPress={onSwap} style={styles.secondaryAction}>
          <Text style={styles.secondaryActionText}>{secondarySwap}</Text>
        </Pressable>
      </View>

      <Pressable onPress={onStart} style={styles.cta}>
        <Text style={styles.ctaText}>{primaryCta}</Text>
      </Pressable>
    </View>
  );
}

function inferLanguage(...parts: string[]) {
  return /[ğĞıİşŞçÇöÖüÜ]/.test(parts.join(' ')) ? 'tr' : 'en';
}

function buildOutcomePreview(language: 'tr' | 'en', todayGain: string, minutes: number) {
  if (todayGain.trim()) {
    return todayGain;
  }

  if (language === 'tr') {
    return `Bugün ${minutes} dk net ilerleme açar.`;
  }

  return `${minutes} min of real progress lands today.`;
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 14,
    shadowColor: '#000000',
    shadowOpacity: 0.34,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 20 },
    elevation: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  directionPill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  directionText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  cardTitle: {
    flex: 1,
    color: theme.colors.textSoft,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  taskText: {
    color: theme.colors.text,
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '800',
    fontFamily: 'Inter_700Bold',
    letterSpacing: -1.1,
  },
  reasonText: {
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  outcomePreview: {
    color: theme.colors.accent,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  momentumLine: {
    color: theme.colors.textSoft,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginTop: -2,
  },
  secondaryAction: {
    paddingVertical: 2,
  },
  secondaryActionText: {
    color: theme.colors.textSoft,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  cta: {
    marginTop: 6,
    width: '100%',
    minHeight: 60,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.34,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  ctaText: {
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
});
