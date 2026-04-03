import { useEffect } from 'react';
import {
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { UiCopy } from '../lib/uiCopy';
import { SupportedLanguage } from '../types';
import { theme } from '../theme';

interface PaywallScreenProps {
  visible: boolean;
  copy: UiCopy;
  language: SupportedLanguage;
  mode: 'soft-success' | 'hard-access';
  body: string;
  prices: {
    monthly: string;
    yearly: string;
    founding: string;
  };
  storeConnected: boolean;
  storeCatalogLoaded: boolean;
  storeBusy: boolean;
  storeError: string | null;
  storeStatusLine: string | null;
  onAnnual: () => void;
  onMonthly: () => void;
  onFounding: () => void;
  onRestore: () => void;
  onClose: () => void;
}

export function PaywallScreen({
  visible,
  copy,
  language,
  mode,
  body,
  prices,
  storeConnected,
  storeCatalogLoaded,
  storeBusy,
  storeError,
  storeStatusLine,
  onAnnual,
  onMonthly,
  onFounding,
  onRestore,
  onClose,
}: PaywallScreenProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(visible ? 1 : 0, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: (1 - progress.value) * 24 },
      { scale: 0.985 + progress.value * 0.015 },
    ],
  }));

  const headline = copy.paywall.pressureHeadline;
  const supportLine =
    mode === 'soft-success'
      ? copy.paywall.supportSoft
      : copy.paywall.supportHard;
  const isRetryMode =
    Boolean(storeError) && storeConnected && !storeCatalogLoaded && !storeBusy;
  const primaryCta = isRetryMode ? copy.paywall.continueCta : copy.paywall.startTrial;
  const benefits = copy.paywall.pressureBenefits;
  const canRetryCatalog =
    Boolean(storeError) && storeConnected && !storeCatalogLoaded;
  const purchaseDisabled =
    storeBusy || !storeConnected || (!storeCatalogLoaded && !canRetryCatalog);
  const secondaryPlanDisabled = storeBusy || !storeConnected || !storeCatalogLoaded;
  const restoreDisabled = storeBusy || !storeConnected;

  const storeLine = getStoreLine({
    copy,
    language,
    storeConnected,
    storeCatalogLoaded,
    storeBusy,
    storeError,
    storeStatusLine,
  });
  const visibleStoreError = getVisibleStoreError(
    copy,
    storeError,
    storeCatalogLoaded
  );

  const openTerms = () => {
    void Linking.openURL(
      'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/'
    );
  };

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.sheet, animatedStyle]}>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Text style={styles.eyebrow}>{copy.paywall.protectEyebrow}</Text>
              <Text style={styles.title}>{headline}</Text>
              <Text numberOfLines={1} style={styles.subtitle}>
                {supportLine}
              </Text>
            </View>

            <View style={styles.benefits}>
              {benefits.map((benefit) => (
                <View key={benefit} style={styles.benefitRow}>
                  <View style={styles.benefitDot} />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>

            <View style={styles.planBlock}>
              <View style={styles.planHero}>
                <View style={styles.planHead}>
                  <Text style={styles.planLabel}>{copy.paywall.annual}</Text>
                  <Text style={styles.badge}>{copy.paywall.annualBadge}</Text>
                </View>
                <Text style={styles.planPrice}>{prices.yearly}</Text>
                <Text style={styles.planSubline}>{copy.paywall.annualSubline}</Text>
              </View>
            </View>

            <Pressable
              disabled={purchaseDisabled}
              onPress={onAnnual}
              style={[
                styles.primaryButton,
                purchaseDisabled && styles.disabledButton,
              ]}
            >
              <Text style={styles.primaryText}>{primaryCta}</Text>
            </Pressable>

            <View style={styles.secondaryPlans}>
              <Pressable
                disabled={secondaryPlanDisabled}
                onPress={onMonthly}
                style={[
                  styles.secondaryPlanButton,
                  secondaryPlanDisabled && styles.disabledSecondary,
                ]}
              >
                <Text style={styles.secondaryPlanLabel}>{copy.paywall.monthly}</Text>
                <Text style={styles.secondaryPlanPrice}>{prices.monthly}</Text>
              </Pressable>

              <Pressable
                disabled={secondaryPlanDisabled}
                onPress={onFounding}
                style={[
                  styles.secondaryPlanButton,
                  secondaryPlanDisabled && styles.disabledSecondary,
                ]}
              >
                <Text style={styles.secondaryPlanLabel}>{copy.paywall.founding}</Text>
                <Text style={styles.secondaryPlanPrice}>{prices.founding}</Text>
              </Pressable>
            </View>

            {body ? (
              <Text numberOfLines={2} style={styles.contextLine}>
                {body}
              </Text>
            ) : null}
            {storeLine ? <Text style={styles.storeLine}>{storeLine}</Text> : null}
            {visibleStoreError ? (
              <Text style={styles.storeError}>{visibleStoreError}</Text>
            ) : null}

            <View style={styles.footerLinks}>
              <Pressable disabled={restoreDisabled} onPress={onRestore}>
                <Text
                  style={[
                    styles.footerLink,
                    restoreDisabled && styles.disabledFooterLink,
                  ]}
                >
                  {copy.paywall.restore}
                </Text>
              </Pressable>
              <Pressable onPress={openTerms}>
                <Text style={styles.footerLink}>{copy.paywall.terms}</Text>
              </Pressable>
              <Pressable onPress={onClose}>
                <Text style={styles.footerLink}>{copy.paywall.close}</Text>
              </Pressable>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

function getStoreLine({
  copy,
  language,
  storeConnected,
  storeCatalogLoaded,
  storeBusy,
  storeError,
  storeStatusLine,
}: {
  copy: UiCopy;
  language: SupportedLanguage;
  storeConnected: boolean;
  storeCatalogLoaded: boolean;
  storeBusy: boolean;
  storeError: string | null;
  storeStatusLine: string | null;
}) {
  if (storeStatusLine) {
    return storeStatusLine;
  }

  if (!storeConnected) {
    return copy.paywall.storeUnavailable;
  }

  if (storeBusy) {
    return null;
  }

  if (!storeCatalogLoaded && storeError) {
    return copy.paywall.storeRetry;
  }

  if (!storeCatalogLoaded) {
    return copy.paywall.storeLoading;
  }

  return null;
}

function getVisibleStoreError(
  copy: UiCopy,
  storeError: string | null,
  storeCatalogLoaded: boolean
) {
  if (!storeError || !storeCatalogLoaded) {
    return null;
  }

  const normalized = storeError.toLowerCase();
  if (normalized.includes('cancel')) {
    return null;
  }

  return copy.paywall.storeActionFailed;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 28,
    backgroundColor: theme.colors.overlay,
  },
  sheet: {
    maxHeight: '86%',
    borderRadius: 28,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 28,
    gap: 28,
  },
  header: {
    gap: 8,
  },
  eyebrow: {
    color: theme.colors.accent,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.3,
  },
  title: {
    color: theme.colors.text,
    fontSize: 40,
    lineHeight: 44,
    fontWeight: '800',
    fontFamily: 'Inter_700Bold',
    letterSpacing: -1.2,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  benefits: {
    gap: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
  },
  benefitText: {
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  planBlock: {
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  planHero: {
    gap: 8,
  },
  planHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  planLabel: {
    color: theme.colors.text,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  badge: {
    color: theme.colors.background,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    fontFamily: 'Inter_700Bold',
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  planPrice: {
    color: theme.colors.text,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '800',
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.8,
  },
  planSubline: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  primaryButton: {
    width: '100%',
    minHeight: 56,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryText: {
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  secondaryPlans: {
    gap: 8,
  },
  secondaryPlanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 42,
    paddingHorizontal: 4,
  },
  disabledSecondary: {
    opacity: 0.52,
  },
  secondaryPlanLabel: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  secondaryPlanPrice: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  contextLine: {
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  storeLine: {
    color: theme.colors.textSoft,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  storeError: {
    color: theme.colors.danger,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    paddingTop: 6,
  },
  footerLink: {
    color: theme.colors.textSoft,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  disabledFooterLink: {
    opacity: 0.42,
  },
});
