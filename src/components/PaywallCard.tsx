import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../theme';

interface PaywallCardProps {
  title: string;
  price: string;
  subline: string;
  badge?: string;
  featured?: boolean;
  onPress: () => void;
}

export function PaywallCard({
  title,
  price,
  subline,
  badge,
  featured,
  onPress,
}: PaywallCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        featured && {
          borderColor: theme.colors.accent,
          backgroundColor: theme.colors.surfaceAlt,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.price}>{price}</Text>
      <Text style={styles.subline}>{subline}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.h2,
    fontWeight: '700',
  },
  badge: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.accentSoft,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
  },
  badgeText: {
    color: theme.colors.accent,
    fontSize: theme.typography.meta,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  price: {
    color: theme.colors.text,
    fontSize: theme.typography.h1,
    fontWeight: '800',
  },
  subline: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
  },
});
