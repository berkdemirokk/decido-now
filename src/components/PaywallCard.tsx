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
        featured ? styles.cardFeatured : null,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subline}>{subline}</Text>
        </View>
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.price}>{price}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  cardFeatured: {
    borderColor: theme.colors.borderGold,
    backgroundColor: 'rgba(214,169,79,0.08)',
    shadowColor: theme.colors.accent,
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 7,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  copy: {
    flex: 1,
    gap: 6,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.h2,
    fontWeight: '800',
  },
  badge: {
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  badgeText: {
    color: theme.colors.accent,
    fontSize: theme.typography.meta,
    fontWeight: '900',
    letterSpacing: 0.9,
  },
  price: {
    color: theme.colors.text,
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '900',
    letterSpacing: -1.1,
  },
  subline: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
});
