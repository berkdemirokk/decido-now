import { useEffect } from 'react';
import { Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { UiCopy } from '../lib/uiCopy';
import { SupportedLanguage } from '../types';

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
    transform: [{ translateY: (1 - progress.value) * 24 }, { scale: 0.985 + progress.value * 0.015 }],
  }));

  const headline = copy.paywall.pressureHeadline;
  const supportLine = mode === 'soft-success' ? copy.paywall.supportSoft : copy.paywall.supportHard;
  const primaryCta = copy.paywall.continueCta;
  const benefits = copy.paywall.pressureBenefits;
  const canRetryCatalog = Boolean(storeError) && storeConnected && !storeCatalogLoaded;
  const purchaseDisabled = storeBusy || !storeConnected || (!storeCatalogLoaded && !canRetryCatalog);
  const restoreDisabled = storeBusy || !storeConnected;

  const storeLine =
    storeStatusLine ??
    (!storeConnected
      ? body
      : !storeCatalogLoaded
        ? canRetryCatalog
          ? language === 'tr'
            ? 'Devam Et’e dokun ve mağazayı yeniden dene.'
            : 'Tap Continue to retry the store.'
          : copy.paywall.monthlySubline
        : null);

  const openTerms = () => {
    void Linking.openURL('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/');
  };

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.sheet, animatedStyle]}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
              style={[styles.primaryButton, purchaseDisabled && styles.disabledButton]}
            >
              <Text style={styles.primaryText}>{primaryCta}</Text>
            </Pressable>

            <View style={styles.secondaryPlans}>
              <Pressable
                disabled={purchaseDisabled}
                onPress={onMonthly}
                style={[styles.secondaryPlanButton, purchaseDisabled && styles.disabledSecondary]}
              >
                <Text style={styles.secondaryPlanLabel}>{copy.paywall.monthly}</Text>
                <Text style={styles.secondaryPlanPrice}>{prices.monthly}</Text>
              </Pressable>

              <Pressable
                disabled={purchaseDisabled}
                onPress={onFounding}
                style={[styles.secondaryPlanButton, purchaseDisabled && styles.disabledSecondary]}
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
            {storeError ? <Text style={styles.storeError}>{storeError}</Text> : null}

            <View style={styles.footerLinks}>
              <Pressable disabled={restoreDisabled} onPress={onRestore}>
                <Text style={[styles.footerLink, restoreDisabled && styles.disabledFooterLink]}>{copy.paywall.restore}</Text>
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

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 28,
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  sheet: {
    maxHeight: '86%',
    borderRadius: 28,
    backgroundColor: '#0B0B0F',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
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
    color: '#00D4FF',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.3,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 40,
    lineHeight: 44,
    fontWeight: '800',
    fontFamily: 'Inter_700Bold',
    letterSpacing: -1.2,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.74)',
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
    backgroundColor: '#6C5CE7',
  },
  benefitText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  planBlock: {
    borderRadius: 20,
    backgroundColor: '#15151C',
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
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
    color: '#FFFFFF',
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  badge: {
    color: '#0B0B0F',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    fontFamily: 'Inter_700Bold',
    backgroundColor: '#00D4FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  planPrice: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '800',
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.8,
  },
  planSubline: {
    color: 'rgba(255,255,255,0.58)',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  primaryButton: {
    width: '100%',
    minHeight: 56,
    borderRadius: 20,
    backgroundColor: '#6C5CE7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6C5CE7',
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryText: {
    color: '#FFFFFF',
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
    color: 'rgba(255,255,255,0.58)',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  secondaryPlanPrice: {
    color: 'rgba(255,255,255,0.66)',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  contextLine: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  storeLine: {
    color: 'rgba(255,255,255,0.44)',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  storeError: {
    color: '#FF8A9B',
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
    color: 'rgba(255,255,255,0.42)',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  disabledFooterLink: {
    opacity: 0.42,
  },
});
