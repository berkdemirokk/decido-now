import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { UiCopy } from '../lib/uiCopy';
import { Suggestion, SupportedLanguage } from '../types';
import { theme } from '../theme';

export interface FocusRunViewModel {
  visible: boolean;
  move: Suggestion | null;
  steps: string[];
  totalSeconds: number;
  secondsLeft: number;
  currentStep: number;
  phase: 'prestart' | 'active' | 'halfway' | 'nearFinish' | 'score' | 'leaveConfirm';
  easyMode: boolean;
  usedGuidance?: boolean;
}

interface FocusRunScreenProps {
  copy: UiCopy;
  language: SupportedLanguage;
  state: FocusRunViewModel;
  onStart: () => void;
  onNext: () => void;
  onMakeEasier: () => void;
  onAskLeave: () => void;
  onResume: () => void;
  onLeaveAnyway: () => void;
  onScore: (score: 1 | 2 | 3 | 4 | 5) => void;
}

export function FocusRunScreen({
  copy,
  state,
  onStart,
  onNext,
  onMakeEasier,
  onAskLeave,
  onResume,
  onLeaveAnyway,
  onScore,
}: FocusRunScreenProps) {
  const entry = useSharedValue(0);
  const pulse = useSharedValue(1);
  const flash = useSharedValue(0);
  const [showSecondaryAction, setShowSecondaryAction] = useState(false);

  useEffect(() => {
    entry.value = withTiming(state.visible ? 1 : 0, {
      duration: 180,
      easing: Easing.out(Easing.cubic),
    });
  }, [entry, state.visible]);

  useEffect(() => {
    if (
      state.visible &&
      (state.phase === 'active' || state.phase === 'halfway' || state.phase === 'nearFinish')
    ) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.025, { duration: 900, easing: Easing.inOut(Easing.quad) }),
          withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        false
      );
      return;
    }

    cancelAnimation(pulse);
    pulse.value = withTiming(1, { duration: 140 });
  }, [pulse, state.phase, state.visible]);

  useEffect(() => {
    if (state.visible && state.phase === 'score') {
      flash.value = withSequence(
        withTiming(0.14, { duration: 90, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 260, easing: Easing.out(Easing.quad) })
      );
      return;
    }

    flash.value = 0;
  }, [flash, state.phase, state.visible]);

  useEffect(() => {
    setShowSecondaryAction(false);

    if (!state.visible) {
      return;
    }

    const shouldDelaySecondary =
      state.phase === 'prestart' ||
      state.phase === 'active' ||
      state.phase === 'halfway' ||
      state.phase === 'nearFinish';

    if (!shouldDelaySecondary) {
      return;
    }

    const delay = state.phase === 'prestart' ? 900 : 5000;
    const timeout = setTimeout(() => {
      setShowSecondaryAction(true);
    }, delay);

    return () => clearTimeout(timeout);
  }, [state.phase, state.visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: entry.value,
    transform: [{ translateY: (1 - entry.value) * 18 }],
  }));

  const timerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flash.value,
  }));

  if (!state.visible || !state.move) {
    return null;
  }

  const currentStep = state.steps[state.currentStep] ?? state.move.action;
  const stepLine = state.phase === 'prestart' ? state.move.action : currentStep;

  return (
    <Modal animationType="slide" presentationStyle="fullScreen" visible={state.visible}>
      <Animated.View style={[styles.screen, animatedStyle]}>
        <StatusBar hidden />
        <Animated.View pointerEvents="none" style={[styles.flashOverlay, flashStyle]} />

        <View style={styles.header}>
          <Text style={styles.title}>{copy.focusRun.title}</Text>
          <Text style={styles.subtitle}>{copy.focusRun.subtitle}</Text>
        </View>

        <View style={styles.center}>
          <Text numberOfLines={1} style={styles.moveLabel}>
            {state.move.title}
          </Text>

          <Animated.View style={[styles.timerWrap, timerStyle]}>
            <View style={styles.timerHalo} />
            <View style={styles.timerCore}>
            <Text style={styles.timer}>{formatTimer(state.secondsLeft)}</Text>
            </View>
          </Animated.View>

          <Text numberOfLines={2} style={styles.stepLine}>
            {stepLine}
          </Text>
        </View>

        <View style={styles.footer}>
          {state.phase === 'prestart' ? (
            <>
              <Pressable onPress={onStart} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>{copy.focusRun.start}</Text>
              </Pressable>

              <View pointerEvents={showSecondaryAction ? 'auto' : 'none'} style={styles.secondarySlot}>
                <Pressable onPress={onMakeEasier} style={[styles.tertiaryButton, !showSecondaryAction ? styles.secondaryHidden : null]}>
                  <Text style={styles.tertiaryButtonText}>{copy.focusRun.makeEasier}</Text>
                </Pressable>
              </View>
            </>
          ) : state.phase === 'score' ? (
            <>
              <Text style={styles.scorePrompt}>{copy.focusRun.scorePrompt}</Text>
              <View style={styles.scoreRow}>
                {[1, 2, 3, 4, 5].map((score) => (
                  <Pressable
                    key={score}
                    onPress={() => onScore(score as 1 | 2 | 3 | 4 | 5)}
                    style={styles.scoreChip}
                  >
                    <Text style={styles.scoreChipText}>{score}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          ) : (
            <>
              <Pressable onPress={onNext} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>
                  {state.currentStep >= state.steps.length - 1 ? copy.focusRun.finish : copy.focusRun.next}
                </Text>
              </Pressable>

              <View pointerEvents={showSecondaryAction ? 'auto' : 'none'} style={styles.secondarySlot}>
                <Pressable onPress={onAskLeave} style={[styles.leaveButton, !showSecondaryAction ? styles.secondaryHidden : null]}>
                  <Text style={styles.leaveButtonText}>{copy.focusRun.leave}</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>

        {state.phase === 'leaveConfirm' ? (
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{copy.focusRun.leaveTitle}</Text>

              <Pressable onPress={onResume} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>{copy.focusRun.resume}</Text>
              </Pressable>

              <Pressable onPress={onLeaveAnyway} style={styles.modalSecondary}>
                <Text style={styles.modalSecondaryText}>{copy.focusRun.leave}</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </Animated.View>
    </Modal>
  );
}

function formatTimer(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = Math.max(0, totalSeconds % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${seconds}`;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.text,
  },
  header: {
    alignItems: 'center',
    gap: 4,
    paddingTop: 4,
  },
  title: {
    color: theme.colors.text,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.2,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  moveLabel: {
    maxWidth: 300,
    color: theme.colors.textSoft,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1.2,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  timerWrap: {
    width: 252,
    height: 252,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  timerHalo: {
    position: 'absolute',
    width: 252,
    height: 252,
    borderRadius: 126,
    borderWidth: 1,
    borderColor: theme.colors.primaryGlow,
    backgroundColor: theme.colors.whiteOverlay,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.22,
    shadowRadius: 34,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  timerCore: {
    minWidth: 220,
    minHeight: 220,
    borderRadius: 110,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  timer: {
    color: theme.colors.text,
    fontSize: 100,
    lineHeight: 104,
    fontWeight: '800',
    fontFamily: 'Inter_700Bold',
    letterSpacing: -4.8,
    textAlign: 'center',
  },
  stepLine: {
    maxWidth: 290,
    color: theme.colors.text,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
  footer: {
    gap: 12,
  },
  secondarySlot: {
    minHeight: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryHidden: {
    opacity: 0,
  },
  primaryButton: {
    width: '100%',
    minHeight: 58,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  primaryButtonText: {
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  tertiaryButton: {
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  tertiaryButtonText: {
    color: theme.colors.textSoft,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  leaveButton: {
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  leaveButtonText: {
    color: theme.colors.textSoft,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  scorePrompt: {
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  scoreChip: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreChipText: {
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    padding: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalTitle: {
    color: theme.colors.text,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSecondary: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSecondaryText: {
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
});
