import { useEffect } from 'react';
import { BlurView } from 'expo-blur';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { PaywallCard } from '../components/PaywallCard';
import { UiCopy } from '../lib/uiCopy';
import { theme } from '../theme';

interface PaywallScreenProps {
  visible: boolean;
  copy: UiCopy;
  prices: {
    monthly: string;
    yearly: string;
    founding: string;
  };
  storeConnected: boolean;
  storeCatalogLoaded: boolean;
  storeError: string | null;
  onAnnual: () => void;
  onMonthly: () => void;
  onFounding: () => void;
  onRestore: () => void;
  onClose: () => void;
}

export function PaywallScreen({
  visible,
  copy,
  prices,
  storeConnected,
  storeCatalogLoaded,
  storeError,
  onAnnual,
  onMonthly,
  onFounding,
  onRestore,
  onClose,
}: PaywallScreenProps) {
  const entry = useSharedValue(0);

  useEffect(() => {
    entry.value = withTiming(visible ? 1 : 0, {
      duration: 260,
      easing: Easing.out(Easing.cubic),
    });
  }, [entry, visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: entry.value,
    transform: [{ translateY: (1 - entry.value) * 24 }, { scale: 0.96 + entry.value * 0.04 }],
  }));

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.sheet, animatedStyle]}>
          <BlurView intensity={82} tint="dark" style={styles.blurFill}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>{copy.paywall.title}</Text>
            <Text style={styles.body}>{copy.paywall.body}</Text>

            <View style={styles.compare}>
              <View style={styles.compareCol}>
                <Text style={styles.compareLabel}>{copy.paywall.free}</Text>
                <Text style={styles.compareItem}>1 move / day</Text>
                <Text style={styles.compareItem}>Basic guidance</Text>
                <Text style={styles.compareItem}>Basic Focus Run</Text>
              </View>
              <View style={styles.compareCol}>
                <Text style={styles.compareLabel}>{copy.paywall.pro}</Text>
                <Text style={styles.compareItem}>Unlimited moves</Text>
                <Text style={styles.compareItem}>Full Focus Run</Text>
                <Text style={styles.compareItem}>DNA + 7-day view</Text>
              </View>
            </View>

            <PaywallCard
              title={copy.paywall.annual}
              price={prices.yearly}
              subline={copy.paywall.annualSubline}
              badge={copy.paywall.annualBadge}
              featured
              onPress={onAnnual}
            />
            <PaywallCard
              title={copy.paywall.monthly}
              price={prices.monthly}
              subline={copy.paywall.monthlySubline}
              onPress={onMonthly}
            />
            <PaywallCard
              title={copy.paywall.founding}
              price={prices.founding}
              subline={copy.paywall.foundingSubline}
              badge={copy.paywall.foundingBadge}
              onPress={onFounding}
            />
            <View style={styles.compareCol}>
              <Text style={styles.compareLabel}>Founding perks</Text>
              <Text style={styles.compareItem}>Exclusive DNA insights</Text>
              <Text style={styles.compareItem}>Early access to new Systems</Text>
              <Text style={styles.compareItem}>Gold profile badge</Text>
            </View>
            <View style={styles.storeStateCard}>
              <Text style={styles.compareLabel}>Store status</Text>
              <Text style={styles.compareItem}>
                {storeConnected
                  ? storeCatalogLoaded
                    ? 'Live App Store catalog connected'
                    : 'Connecting to App Store catalog'
                  : 'Native store is unavailable in this environment'}
              </Text>
              {storeError ? <Text style={styles.storeError}>{storeError}</Text> : null}
            </View>
          </ScrollView>
          <View style={styles.footer}>
            <Pressable onPress={onAnnual} style={styles.primaryButton}>
              <Text style={styles.primaryText}>{copy.paywall.startTrial}</Text>
            </Pressable>
            <Pressable onPress={onMonthly} style={styles.secondaryButton}>
              <Text style={styles.secondaryText}>{copy.paywall.chooseMonthly}</Text>
            </Pressable>
            <Pressable onPress={onFounding} style={styles.secondaryButton}>
              <Text style={styles.secondaryText}>{copy.paywall.chooseFounding}</Text>
            </Pressable>
            <Pressable onPress={onRestore} style={styles.ghostButton}>
              <Text style={styles.ghostText}>{copy.paywall.restore}</Text>
            </Pressable>
            <Pressable onPress={onClose} style={styles.ghostButton}>
              <Text style={styles.ghostText}>{copy.paywall.continueFree}</Text>
            </Pressable>
          </View>
          </BlurView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '90%',
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    borderTopWidth: 1,
    borderColor: theme.colors.borderStrong,
    overflow: 'hidden',
  },
  blurFill: {
    backgroundColor: 'rgba(9,13,20,0.86)',
  },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.h1,
    fontWeight: '700',
  },
  body: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  compare: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  compareCol: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: 6,
  },
  compareLabel: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  compareItem: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.label,
  },
  storeStateCard: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    gap: 6,
  },
  storeError: {
    color: theme.colors.danger,
    fontSize: theme.typography.label,
    lineHeight: 18,
  },
  footer: {
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
  },
  primaryButton: {
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.accent,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryText: {
    color: '#1b1202',
    fontSize: theme.typography.body,
    fontWeight: '800',
  },
  secondaryButton: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryText: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  ghostButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  ghostText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    fontWeight: '600',
  },
});
