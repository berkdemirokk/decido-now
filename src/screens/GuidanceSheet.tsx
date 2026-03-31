import { useEffect } from 'react';
import { BlurView } from 'expo-blur';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { FutureProjection } from '../lib/futureProjection';
import { GuidancePack } from '../lib/guidance';
import { UiCopy } from '../lib/uiCopy';
import { theme } from '../theme';

interface GuidanceSheetProps {
  visible: boolean;
  copy: UiCopy;
  title: string;
  guidance: GuidancePack | null;
  projection: FutureProjection | null;
  guidanceTier: 'basic' | 'full';
  lockedProjection: boolean;
  onClose: () => void;
  onStart: () => void;
  onUpgrade?: () => void;
}

export function GuidanceSheet({
  visible,
  copy,
  title,
  guidance,
  projection,
  guidanceTier,
  lockedProjection,
  onClose,
  onStart,
  onUpgrade,
}: GuidanceSheetProps) {
  const isTurkish = copy.tabs.today === 'Bugun';
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(visible ? 1 : 0, {
      duration: 240,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: (1 - progress.value) * 24 },
      { scale: 0.965 + progress.value * 0.035 },
    ],
  }));

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.sheet, animatedStyle]}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.handle} />

            <View style={styles.hero}>
              <View style={styles.heroHeader}>
                <Text style={styles.eyebrow}>
                  {isTurkish ? 'TAKTIK OKUMA' : 'TACTICAL READ'}
                </Text>
                <View style={styles.tierPill}>
                  <Text style={styles.tierText}>
                    {guidanceTier === 'full'
                      ? isTurkish
                        ? 'DERIN'
                        : 'FULL'
                      : isTurkish
                        ? 'TEMEL'
                        : 'BASIC'}
                  </Text>
                </View>
              </View>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.heroBody}>
                {isTurkish
                  ? 'Bu hamle neden secildi, nasil acilacagi ve seni bugun nereye tasiyacagi burada netlesir.'
                  : 'This is the clean read: why this move was chosen, how to run it, and what it changes today.'}
              </Text>
            </View>

            {guidance ? (
              <>
                <Section
                  label={copy.guidance.whyFits}
                  body={guidance.whyFits}
                  emphasis={guidance.whatYouGain}
                  emphasisLabel={copy.guidance.todayGain}
                />

                <SectionList label={copy.guidance.howToStart} items={guidance.steps} />

                {guidanceTier === 'full' ? (
                  <>
                    <Section
                      label={isTurkish ? 'DIRENC NOKTASI' : 'RESISTANCE READ'}
                      body={guidance.tinyLesson}
                    />
                    <Section
                      label={isTurkish ? 'NEYI KAPATIRSIN' : 'EXPECTED CLOSE'}
                      body={guidance.expectedOutcome}
                      emphasis={guidance.continueTomorrow}
                      emphasisLabel={copy.guidance.tomorrowGain}
                    />
                  </>
                ) : (
                  <BlurView intensity={86} tint="dark" style={styles.upgradeCard}>
                    <Text style={styles.label}>{copy.guidance.depthTitle}</Text>
                    <Text style={styles.body}>{copy.guidance.depthBody}</Text>
                    {onUpgrade ? (
                      <Pressable onPress={onUpgrade} style={styles.inlineUpgradeButton}>
                        <Text style={styles.inlineUpgradeText}>{copy.guidance.upgrade}</Text>
                      </Pressable>
                    ) : null}
                  </BlurView>
                )}

                {projection ? (
                  <Section
                    label={copy.guidance.projection}
                    body={lockedProjection ? projection.teaser : projection.positive}
                    secondary={
                      lockedProjection ? copy.guidance.lockedProjection : projection.negative
                    }
                  />
                ) : null}
              </>
            ) : null}
          </ScrollView>

          <View style={styles.actions}>
            <Pressable onPress={onStart} style={styles.primaryButton}>
              <Text style={styles.primaryText}>{copy.guidance.start}</Text>
            </Pressable>
            <Pressable onPress={onClose} style={styles.secondaryButton}>
              <Text style={styles.secondaryText}>{copy.guidance.close}</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

function Section({
  label,
  body,
  secondary,
  emphasis,
  emphasisLabel,
}: {
  label: string;
  body: string;
  secondary?: string;
  emphasis?: string;
  emphasisLabel?: string;
}) {
  return (
    <BlurView intensity={82} tint="dark" style={styles.section}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.body}>{body}</Text>
      {emphasis ? (
        <View style={styles.emphasisBlock}>
          {emphasisLabel ? <Text style={styles.emphasisLabel}>{emphasisLabel}</Text> : null}
          <Text style={styles.emphasisBody}>{emphasis}</Text>
        </View>
      ) : null}
      {secondary ? <Text style={styles.secondaryBody}>{secondary}</Text> : null}
    </BlurView>
  );
}

function SectionList({ label, items }: { label: string; items: string[] }) {
  return (
    <BlurView intensity={82} tint="dark" style={styles.section}>
      <Text style={styles.label}>{label}</Text>
      {items.map((item, index) => (
        <View key={`${label}-${index}`} style={styles.stepRow}>
          <View style={styles.stepDot}>
            <Text style={styles.stepIndex}>{index + 1}</Text>
          </View>
          <Text style={styles.body}>{item}</Text>
        </View>
      ))}
    </BlurView>
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
    backgroundColor: theme.colors.surfaceMuted,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    borderTopWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  handle: {
    alignSelf: 'center',
    width: 56,
    height: 5,
    borderRadius: 999,
    backgroundColor: theme.colors.borderStrong,
  },
  hero: {
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    ...theme.shadow.gold,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  eyebrow: {
    color: theme.colors.accent,
    fontSize: theme.typography.meta,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  tierPill: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
  },
  tierText: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.meta,
    fontWeight: '800',
    letterSpacing: 0.9,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.h1,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  heroBody: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  section: {
    gap: theme.spacing.sm,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: 'rgba(11,11,12,0.8)',
  },
  label: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.meta,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  body: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  secondaryBody: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  emphasisBlock: {
    borderRadius: theme.radius.md,
    backgroundColor: 'rgba(212,162,76,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212,162,76,0.22)',
    padding: theme.spacing.md,
    gap: 4,
  },
  emphasisLabel: {
    color: theme.colors.accent,
    fontSize: theme.typography.meta,
    fontWeight: '800',
    letterSpacing: 0.9,
  },
  emphasisBody: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    lineHeight: 22,
    fontWeight: '600',
  },
  stepRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    alignItems: 'flex-start',
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: theme.colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepIndex: {
    color: theme.colors.accent,
    fontSize: theme.typography.meta,
    fontWeight: '900',
  },
  upgradeCard: {
    gap: theme.spacing.sm,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(212,162,76,0.26)',
    backgroundColor: 'rgba(212,162,76,0.08)',
  },
  actions: {
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
  },
  primaryButton: {
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.accent,
    paddingVertical: 16,
    alignItems: 'center',
    ...theme.shadow.gold,
  },
  primaryText: {
    color: '#1b1202',
    fontSize: theme.typography.body,
    fontWeight: '900',
  },
  secondaryButton: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceAlt,
  },
  secondaryText: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  inlineUpgradeButton: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    marginTop: 4,
  },
  inlineUpgradeText: {
    color: '#1b1202',
    fontSize: theme.typography.body,
    fontWeight: '800',
  },
});
