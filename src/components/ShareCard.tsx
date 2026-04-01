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
  const accentColor =
    variant === 'recovery'
      ? theme.colors.success
      : variant === 'streak'
        ? theme.colors.accent
        : theme.colors.text;

  return (
    <View style={styles.card}>
      <View style={[styles.glow, { backgroundColor: `${accentColor}24` }]} />
      <View style={styles.topRow}>
        <Text style={styles.brand}>DECIDO NOW</Text>
        {badge ? <Text style={styles.badge}>{badge}</Text> : null}
      </View>

      <Text style={[styles.eyebrow, { color: accentColor }]}>{headline}</Text>
      <Text style={styles.title}>{moveTitle}</Text>
      <Text style={styles.result}>{resultLine}</Text>

      <View style={styles.footer}>
        {personaLine ? <Text style={styles.persona}>{personaLine}</Text> : null}
        <Text style={styles.streak}>{streakLine}</Text>
        {deepLink ? <Text style={styles.deepLink}>See your DNA: {deepLink}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: '#090d12',
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
    overflow: 'hidden',
    ...theme.shadow.card,
  },
  glow: {
    position: 'absolute',
    right: -30,
    top: -50,
    width: 240,
    height: 240,
    borderRadius: 999,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  brand: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.meta,
    fontWeight: '900',
    letterSpacing: 1.8,
  },
  badge: {
    color: theme.colors.accent,
    fontSize: theme.typography.meta,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  eyebrow: {
    fontSize: theme.typography.meta,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.display,
    lineHeight: 40,
    fontWeight: '800',
    letterSpacing: -0.9,
  },
  result: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    lineHeight: 22,
    fontWeight: '600',
  },
  footer: {
    gap: 6,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  persona: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  streak: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  deepLink: {
    color: theme.colors.accent,
    fontSize: theme.typography.label,
    fontWeight: '700',
    lineHeight: 18,
  },
});
