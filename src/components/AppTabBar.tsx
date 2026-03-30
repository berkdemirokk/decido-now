import { BlurView } from 'expo-blur';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppTabKey } from '../types';
import { theme } from '../theme';

interface AppTabBarProps {
  current: AppTabKey;
  items: Array<{ key: AppTabKey; label: string }>;
  onChange: (tab: AppTabKey) => void;
}

export function AppTabBar({ current, items, onChange }: AppTabBarProps) {
  return (
    <BlurView intensity={72} tint="dark" style={styles.bar}>
      <View style={styles.row}>
        {items.map((item) => {
          const active = item.key === current;
          return (
            <Pressable
              key={item.key}
              onPress={() => onChange(item.key)}
              style={[styles.item, active && styles.itemActive]}
            >
              <Text style={[styles.label, active && styles.labelActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: 'rgba(12,17,24,0.74)',
    borderTopWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    borderRadius: theme.radius.md,
    paddingVertical: 12,
  },
  itemActive: {
    backgroundColor: theme.colors.surfaceAlt,
  },
  label: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.label,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  labelActive: {
    color: theme.colors.text,
  },
});
