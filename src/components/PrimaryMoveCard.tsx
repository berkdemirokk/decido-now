import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Suggestion } from '../types';

interface PrimaryMoveCardProps {
  move: Suggestion;
  accentColor: string;
  directionLabel: string;
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
  cardTitle,
  reason,
  primaryCta,
  onStart,
  onWhy,
  onSwap,
}: PrimaryMoveCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{cardTitle || move.title}</Text>
      <Text style={styles.taskText}>{move.action}</Text>

      <Pressable
        onPress={onWhy}
        onLongPress={onSwap}
        delayLongPress={320}
        hitSlop={8}
        style={styles.reasonAction}
      >
        <Text numberOfLines={1} style={styles.reasonText}>
          {reason}
        </Text>
      </Pressable>

      <Pressable onPress={onStart} style={styles.cta}>
        <Text style={styles.ctaText}>{primaryCta}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 20,
    backgroundColor: '#15151C',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.34,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 20 },
    elevation: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  cardTitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  taskText: {
    color: '#FFFFFF',
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '800',
    fontFamily: 'Inter_700Bold',
    letterSpacing: -1.1,
  },
  reasonText: {
    color: 'rgba(255,255,255,0.64)',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  reasonAction: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  cta: {
    marginTop: 10,
    width: '100%',
    minHeight: 60,
    borderRadius: 20,
    backgroundColor: '#6C5CE7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6C5CE7',
    shadowOpacity: 0.34,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
});
