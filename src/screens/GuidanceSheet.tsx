import { useEffect } from 'react';
import { BlurView } from 'expo-blur';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

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
  lockedProjection: boolean;
  onClose: () => void;
  onStart: () => void;
}

export function GuidanceSheet({
  visible,
  copy,
  title,
  guidance,
  projection,
  lockedProjection,
  onClose,
  onStart,
}: GuidanceSheetProps) {
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
      { scale: 0.96 + progress.value * 0.04 },
    ],
  }));

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.sheet, animatedStyle]}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>{title}</Text>
            {guidance ? (
              <>
                <Section label={copy.guidance.whyFits} body={guidance.whyFits} />
                <SectionList label={copy.guidance.howToStart} items={guidance.steps} />
                <Section label={copy.guidance.todayGain} body={guidance.whatYouGain} />
                <Section label="TINY LESSON" body={guidance.tinyLesson} />
                <Section label="EXPECTED OUTCOME" body={guidance.expectedOutcome} />
                <Section label={copy.guidance.tomorrowGain} body={guidance.continueTomorrow} />
                {projection ? (
                  <Section
                    label={copy.guidance.projection}
                    body={lockedProjection ? projection.teaser : projection.positive}
                    secondary={!lockedProjection ? projection.negative : copy.guidance.lockedProjection}
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
}: {
  label: string;
  body: string;
  secondary?: string;
}) {
  return (
    <BlurView intensity={78} tint="dark" style={styles.section}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.body}>{body}</Text>
      {secondary ? <Text style={styles.secondaryBody}>{secondary}</Text> : null}
    </BlurView>
  );
}

function SectionList({ label, items }: { label: string; items: string[] }) {
  return (
    <BlurView intensity={78} tint="dark" style={styles.section}>
      <Text style={styles.label}>{label}</Text>
      {items.map((item, index) => (
        <View key={`${label}-${index}`} style={styles.stepRow}>
          <Text style={styles.stepIndex}>{index + 1}</Text>
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
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.h1,
    fontWeight: '700',
  },
  section: {
    gap: theme.spacing.sm,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: 'rgba(15,19,27,0.58)',
  },
  label: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.meta,
    fontWeight: '700',
    letterSpacing: 1,
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
  stepRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    alignItems: 'flex-start',
  },
  stepIndex: {
    color: theme.colors.accent,
    fontSize: theme.typography.body,
    fontWeight: '800',
    minWidth: 18,
  },
  actions: {
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
});
