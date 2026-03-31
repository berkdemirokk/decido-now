import { useEffect } from 'react';
import { BlurView } from 'expo-blur';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { PaywallCard } from '../components/PaywallCard';
import { UiCopy } from '../lib/uiCopy';
import { theme } from '../theme';

interface PaywallScreenProps {
  visible: boolean;
  copy: UiCopy;
  mode: 'soft-success' | 'hard-access';
  body: string;
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
  mode,
  body,
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
  const isTurkish = copy.tabs.today === 'Bugun';
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
          <BlurView intensity={86} tint="dark" style={styles.blurFill}>
            <ScrollView contentContainerStyle={styles.content}>
              <Text style={styles.eyebrow}>
                {mode === 'soft-success' ? 'MOMENTUM UPGRADE' : 'PROTECT THE DAY'}
              </Text>
              <Text style={styles.title}>
                {mode === 'soft-success' ? copy.paywall.softTitle : copy.paywall.hardTitle}
              </Text>
              <Text style={styles.body}>{body}</Text>

              <View style={styles.promiseCard}>
                <Text style={styles.promiseTitle}>
                  {isTurkish ? 'Pro neyi degistirir?' : 'What Pro actually changes'}
                </Text>
                <Text style={styles.promiseText}>
                  {isTurkish
                    ? 'Daha fazla ozellik degil. Daha az kayip, daha hizli toparlanma ve daha net yon.'
                    : 'Not more features. Less loss, faster recovery, and clearer direction.'}
                </Text>
              </View>

              <View style={styles.compare}>
                <View style={styles.compareCol}>
                  <Text style={styles.compareLabel}>{copy.paywall.free}</Text>
                  <Text style={styles.compareItem}>
                    {isTurkish ? 'Sinirli gunluk execution' : 'Limited daily execution'}
                  </Text>
                  <Text style={styles.compareItem}>
                    {isTurkish ? 'Acilis seviyesinde rehberlik' : 'Opening-level guidance'}
                  </Text>
                  <Text style={styles.compareItem}>
                    {isTurkish ? 'Temel toparlanma' : 'Basic recovery'}
                  </Text>
                </View>
                <View style={styles.compareColStrong}>
                  <Text style={styles.compareLabel}>{copy.paywall.pro}</Text>
                  <Text style={styles.compareItemStrong}>
                    {isTurkish ? 'Sinirsiz execution' : 'Unlimited execution'}
                  </Text>
                  <Text style={styles.compareItemStrong}>
                    {isTurkish ? 'Daha temiz yon ve daha derin okuma' : 'Sharper direction and deeper read'}
                  </Text>
                  <Text style={styles.compareItemStrong}>
                    {isTurkish ? 'Daha guclu koruma ve recovery' : 'Stronger protection and recovery'}
                  </Text>
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

              <View style={styles.storeStateCard}>
                <Text style={styles.compareLabel}>{isTurkish ? 'Magaza durumu' : 'Store status'}</Text>
                <Text style={styles.compareItem}>
                  {storeConnected
                    ? storeCatalogLoaded
                      ? isTurkish
                        ? 'Canli App Store katalogu baglandi'
                        : 'Live App Store catalog connected'
                      : isTurkish
                        ? 'App Store kataloguna baglaniyor'
                        : 'Connecting to App Store catalog'
                    : isTurkish
                      ? 'Bu ortamda native store kullanilamiyor'
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
    backgroundColor: 'rgba(6,6,6,0.92)',
  },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  eyebrow: {
    color: theme.colors.accent,
    fontSize: theme.typography.meta,
    fontWeight: '800',
    letterSpacing: 1.4,
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
  promiseCard: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(212,162,76,0.22)',
    backgroundColor: 'rgba(212,162,76,0.08)',
    padding: theme.spacing.md,
    gap: 6,
  },
  promiseTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  promiseText: {
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
    gap: 8,
  },
  compareColStrong: {
    flex: 1,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    padding: theme.spacing.md,
    gap: 8,
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
  compareItemStrong: {
    color: theme.colors.text,
    fontSize: theme.typography.label,
    fontWeight: '700',
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
    ...theme.shadow.gold,
  },
  primaryText: {
    color: '#140d03',
    fontSize: theme.typography.body,
    fontWeight: '900',
  },
  secondaryButton: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surfaceAlt,
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
