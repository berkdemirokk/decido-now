import { useEffect } from 'react';
import { BlurView } from 'expo-blur';
import {
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

import { FutureProjection } from '../lib/futureProjection';
import { GuidancePack } from '../lib/guidance';
import { UiCopy } from '../lib/uiCopy';
import { SupportedLanguage } from '../types';
import { theme } from '../theme';

interface GuidanceSheetProps {
  visible: boolean;
  copy: UiCopy;
  language: SupportedLanguage;
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
  language,
  title,
  guidance,
  projection,
  guidanceTier,
  lockedProjection,
  onClose,
  onStart,
  onUpgrade,
}: GuidanceSheetProps) {
  const isTurkish = language === 'tr';
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(visible ? 1 : 0, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 18 }],
  }));

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.sheet, animatedStyle]}>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.handle} />

            <View style={styles.hero}>
              <Text style={styles.eyebrow}>{copy.guidance.title.toUpperCase()}</Text>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.heroBody}>
                {isTurkish
                  ? 'Bu kısa brifing, neden bugün bu hamlenin seçildiğini ve nasıl temiz kapatacağını gösterir.'
                  : 'This brief shows why this move landed today and how to close it cleanly.'}
              </Text>
            </View>

            {guidance ? (
              <>
                <BriefRow label={copy.guidance.whyFits} body={guidance.whyFits} />
                <BriefList label={copy.guidance.howToStart} items={guidance.steps} />
                <BriefRow
                  label={copy.guidance.todayGain}
                  body={guidance.whatYouGain}
                />

                {guidanceTier === 'full' ? (
                  <>
                    <BriefRow
                      label={isTurkish ? 'DİRENÇ NOKTASI' : 'RESISTANCE'}
                      body={guidance.tinyLesson}
                    />
                    <BriefRow
                      label={isTurkish ? 'TEMİZ KAPANIŞ' : 'CLEAN CLOSE'}
                      body={guidance.expectedOutcome}
                    />
                    <BriefRow
                      label={copy.guidance.projection}
                      body={guidance.continueTomorrow}
                      hint={
                        projection
                          ? lockedProjection
                            ? projection.teaser
                            : projection.positive
                          : undefined
                      }
                    />
                  </>
                ) : (
                  <>
                    <BriefRow
                      label={copy.guidance.projection}
                      body={guidance.continueTomorrow}
                      hint={projection ? projection.teaser : copy.guidance.lockedProjection}
                    />
                    <BlurView intensity={82} tint="dark" style={styles.lockedBlock}>
                      <Text style={styles.lockedLabel}>{copy.guidance.depthTitle}</Text>
                      <Text style={styles.lockedBody}>{copy.guidance.depthBody}</Text>
                      {onUpgrade ? (
                        <Pressable onPress={onUpgrade} style={styles.upgradeButton}>
                          <Text style={styles.upgradeText}>{copy.guidance.upgrade}</Text>
                        </Pressable>
                      ) : null}
                    </BlurView>
                  </>
                )}
              </>
            ) : null}
          </ScrollView>

          <View style={styles.footer}>
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

function BriefRow({
  label,
  body,
  hint,
}: {
  label: string;
  body: string;
  hint?: string;
}) {
  return (
    <View style={styles.rowBlock}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowBody}>{body}</Text>
      {hint ? <Text style={styles.rowHint}>{hint}</Text> : null}
    </View>
  );
}

function BriefList({ label, items }: { label: string; items: string[] }) {
  return (
    <View style={styles.rowBlock}>
      <Text style={styles.rowLabel}>{label}</Text>
      {items.map((item, index) => (
        <View key={`${label}-${index}`} style={styles.stepRow}>
          <Text style={styles.stepIndex}>{index + 1}</Text>
          <Text style={styles.rowBody}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: theme.colors.overlay,
  },
  sheet: {
    maxHeight: '88%',
    backgroundColor: theme.colors.surfaceMuted,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    borderTopWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  handle: {
    alignSelf: 'center',
    width: 58,
    height: 5,
    borderRadius: 999,
    backgroundColor: theme.colors.borderStrong,
  },
  hero: {
    gap: theme.spacing.sm,
  },
  eyebrow: {
    color: theme.colors.accent,
    fontSize: theme.typography.meta,
    fontWeight: '900',
    letterSpacing: 1.6,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.h1,
    fontWeight: '800',
    lineHeight: 34,
  },
  heroBody: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 23,
  },
  rowBlock: {
    gap: 8,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  rowLabel: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.meta,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  rowBody: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.typography.body,
    lineHeight: 23,
  },
  rowHint: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  stepRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    alignItems: 'flex-start',
  },
  stepIndex: {
    width: 22,
    color: theme.colors.accent,
    fontSize: theme.typography.body,
    fontWeight: '900',
  },
  lockedBlock: {
    overflow: 'hidden',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    padding: theme.spacing.md,
    gap: 8,
    backgroundColor: theme.colors.whiteOverlay,
  },
  lockedLabel: {
    color: theme.colors.accent,
    fontSize: theme.typography.meta,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  lockedBody: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  upgradeButton: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    marginTop: 4,
  },
  upgradeText: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: '800',
  },
  footer: {
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  primaryButton: {
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryText: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: '900',
  },
  secondaryButton: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: theme.colors.whiteOverlay,
  },
  secondaryText: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
});
