import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../theme';

interface ShareCardProps {
  variant?: 'completion' | 'recovery' | 'streak' | 'preview';
  headline: string;
  moveTitle: string;
  resultLine: string;
  streakLine: string;
  personaLine?: string | null;
  badge?: string | null;
  deepLink?: string | null;
}

export function ShareCard({
  variant = 'preview',
  headline,
  moveTitle,
  resultLine,
  streakLine,
  personaLine,
  badge,
  deepLink,
}: ShareCardProps) {
  return (
    <View style={[styles.card, variant !== 'preview' && styles.cardElevated]}>
      <View
        style={[
          styles.accentLine,
          variant === 'recovery'
            ? styles.recoveryAccent
            : variant === 'streak'
              ? styles.streakAccent
              : styles.completionAccent,
        ]}
      />

      <View style={styles.glow} />

      <View style={styles.topRow}>
        <Text style={styles.brand}>DECIDO NOW</Text>
        {badge ? <Text style={styles.badge}>{badge}</Text> : null}
      </View>

      <Text style={styles.eyebrow}>{headline}</Text>
      <Text style={styles.title}>{moveTitle}</Text>
      <Text style={styles.result}>{resultLine}</Text>

      <View style={styles.bottomBlock}>
        {personaLine ? <Text style={styles.persona}>{personaLine}</Text> : null}
        <Text style={styles.streak}>{streakLine}</Text>
      </View>

      {deepLink ? <Text style={styles.deepLink}>{deepLink}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#060606',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
    overflow: 'hidden',
  },
  cardElevated: {
    ...theme.shadow.card,
  },
  glow: {
    position: 'absolute',
    width: 220,
    height: 220,
    right: -30,
    top: -40,
    borderRadius: 999,
    backgroundColor: 'rgba(212,162,76,0.08)',
  },
  accentLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 5,
  },
  completionAccent: {
    backgroundColor: theme.colors.accent,
  },
  recoveryAccent: {
    backgroundColor: theme.colors.success,
  },
  streakAccent: {
    backgroundColor: '#f1c15c',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  brand: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.meta,
    fontWeight: '800',
    letterSpacing: 1.8,
  },
  badge: {
    color: '#f1c15c',
    fontSize: theme.typography.meta,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  eyebrow: {
    color: theme.colors.accent,
    fontSize: theme.typography.meta,
    fontWeight: '800',
    letterSpacing: 1.3,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.display,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  result: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    lineHeight: 22,
    fontWeight: '600',
  },
  bottomBlock: {
    gap: 6,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  streak: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  persona: {
    color: theme.colors.accent,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  deepLink: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.meta,
    fontWeight: '700',
  },
});
