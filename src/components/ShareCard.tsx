import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../theme';

interface ShareCardProps {
  headline: string;
  moveTitle: string;
  resultLine: string;
  streakLine: string;
  personaLine?: string | null;
  badge?: string | null;
  deepLink?: string | null;
}

export function ShareCard({
  headline,
  moveTitle,
  resultLine,
  streakLine,
  personaLine,
  badge,
  deepLink,
}: ShareCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.brand}>DECIDO NOW</Text>
        {badge ? <Text style={styles.badge}>{badge}</Text> : null}
      </View>
      <Text style={styles.eyebrow}>{headline}</Text>
      <Text style={styles.title}>{moveTitle}</Text>
      <Text style={styles.result}>{resultLine}</Text>
      {personaLine ? <Text style={styles.persona}>{personaLine}</Text> : null}
      <Text style={styles.streak}>{streakLine}</Text>
      {deepLink ? <Text style={styles.deepLink}>{deepLink}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0c1118',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
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
    letterSpacing: 1.6,
  },
  badge: {
    color: '#facc15',
    fontSize: theme.typography.meta,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  eyebrow: {
    color: theme.colors.accent,
    fontSize: theme.typography.meta,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.display,
    lineHeight: 40,
    fontWeight: '700',
  },
  result: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  streak: {
    color: theme.colors.text,
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
