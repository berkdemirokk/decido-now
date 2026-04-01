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
    <View pointerEvents="box-none" style={styles.wrap}>
      <BlurView intensity={92} tint="dark" style={styles.bar}>
        <View style={styles.row}>
          {items.map((item) => {
            const active = item.key === current;
            return (
              <Pressable
                key={item.key}
                onPress={() => onChange(item.key)}
                style={[styles.item, active && styles.itemActive]}
              >
                {active ? <View style={styles.activeDot} /> : null}
                <Text style={[styles.label, active && styles.labelActive]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
  },
  bar: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: 'rgba(7,10,14,0.76)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  row: {
    flexDirection: 'row',
    padding: 8,
    gap: 8,
  },
  item: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    gap: 5,
  },
  itemActive: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: theme.colors.borderGold,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: theme.colors.accent,
  },
  label: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.label,
    fontWeight: '800',
    letterSpacing: 0.75,
  },
  labelActive: {
    color: theme.colors.text,
  },
});
