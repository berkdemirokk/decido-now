import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { LiveActivityMock } from '../components/LiveActivityMock';
import { UiCopy } from '../lib/uiCopy';
import { Suggestion } from '../types';
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
  const isTurkish = copy.tabs.today === 'Bugun';
  const entry = useSharedValue(0);

  useEffect(() => {
    entry.value = withTiming(state.visible ? 1 : 0, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [entry, state.visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: entry.value,
    transform: [{ translateY: (1 - entry.value) * 18 }],
  }));

  if (!state.visible || !state.move) {
    return null;
  }

  const progress = 1 - state.secondsLeft / Math.max(1, state.totalSeconds);
  const currentStepName =
    state.phase === 'prestart'
      ? state.move.title
      : state.steps[state.currentStep] ?? state.move.action;
  const statusTone =
    state.easyMode || state.move.id.startsWith('reset-')
      ? copy.focusRun.recoveryLine
      : state.phase === 'prestart'
        ? copy.focusRun.prestartLine
        : copy.focusRun.activeLine;

  return (
    <Modal animationType="slide" presentationStyle="fullScreen" visible={state.visible}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <StatusBar hidden />

        <View style={styles.chromeFade} />

        <View style={styles.topBlock}>
          <Text style={styles.eyebrow}>{copy.focusRun.title.toUpperCase()}</Text>
          <View style={styles.headerRow}>
            <View style={styles.statusPill}>
              <Text style={styles.statusPillText}>
                {state.phase === 'prestart'
                  ? isTurkish
                    ? 'KILIT ONCESI'
                    : 'PRE-COMMIT'
                  : state.phase === 'score'
                    ? isTurkish
                      ? 'KAPANIS'
                      : 'CLOSEOUT'
                    : isTurkish
                      ? 'RUN CANLI'
                      : 'RUN LIVE'}
              </Text>
            </View>
            <Text style={styles.windowText}>
              {state.easyMode
                ? isTurkish
                  ? '2 DAKIKALIK KURTARMA'
                  : '2-MINUTE SAVE'
                : isTurkish
                  ? 'BUGUNUN KAPANISI'
                  : "TODAY'S CLOSE"}
            </Text>
          </View>
          <Text style={styles.title}>{state.move.title}</Text>
          <Text style={styles.commitLine}>{statusTone}</Text>
          {state.phase === 'prestart' ? (
            <Text style={styles.lockLine}>{copy.focusRun.lockLine}</Text>
          ) : null}
        </View>

        <View style={styles.liveShell}>
          <LiveActivityMock
            stepName={currentStepName}
            progress={progress}
            timeRemaining={formatTimer(state.secondsLeft)}
          />
        </View>

        <View style={styles.timerShell}>
          <Text style={styles.timerLabel}>
            {state.phase === 'halfway'
              ? copy.focusRun.halfway
              : state.phase === 'nearFinish'
                ? copy.focusRun.nearFinish
                : state.easyMode
                  ? copy.focusRun.makeEasier
                  : isTurkish
                    ? 'HAMLE CANLI'
                    : 'MOVE LIVE'}
          </Text>
          <Text style={styles.timerValue}>{formatTimer(state.secondsLeft)}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.max(8, progress * 100)}%` }]} />
          </View>
        </View>

        {state.phase === 'prestart' ? (
          <View style={styles.prestart}>
            <View style={styles.commitCard}>
              <Text style={styles.commitCardLabel}>
                {isTurkish ? 'SIMDI YAPACAGIN' : 'YOUR NEXT ACTION'}
              </Text>
              <Text style={styles.stepText}>{state.move.action}</Text>
            </View>
            <Pressable onPress={onStart} style={styles.primaryButton}>
              <Text style={styles.primaryText}>{copy.focusRun.start}</Text>
            </Pressable>
            <Pressable onPress={onMakeEasier} style={styles.secondaryButton}>
              <Text style={styles.secondaryText}>{copy.focusRun.makeEasier}</Text>
            </Pressable>
          </View>
        ) : state.phase === 'score' ? (
          <View style={styles.scoreState}>
            <Text style={styles.completedTitle}>{copy.focusRun.completed}</Text>
            <Text style={styles.completedBody}>{copy.focusRun.completedBody}</Text>
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
          </View>
        ) : (
          <View style={styles.activeState}>
            <Text style={styles.stepLabel}>
              {isTurkish ? 'ADIM' : 'STEP'} {Math.min(state.currentStep + 1, state.steps.length)}{' '}
              {isTurkish ? '/' : 'OF'} {state.steps.length}
            </Text>
            <Text style={styles.stepText}>{state.steps[state.currentStep] ?? state.move.action}</Text>
            <View style={styles.actionRow}>
              <Pressable onPress={onAskLeave} style={styles.secondaryButton}>
                <Text style={styles.secondaryText}>{copy.focusRun.leave}</Text>
              </Pressable>
              <Pressable onPress={onNext} style={styles.primaryButtonCompact}>
                <Text style={styles.primaryText}>
                  {state.currentStep >= state.steps.length - 1
                    ? copy.focusRun.finish
                    : copy.focusRun.next}
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {state.phase === 'leaveConfirm' ? (
          <View style={styles.leaveCard}>
            <Text style={styles.leaveTitle}>{copy.focusRun.leaveTitle}</Text>
            <Text style={styles.leaveBody}>{copy.focusRun.leaveBody}</Text>
            <Text style={styles.leaveHint}>{copy.focusRun.partialFollowUp}</Text>
            <View style={styles.leaveActions}>
              <Pressable onPress={onResume} style={styles.secondaryButton}>
                <Text style={styles.secondaryText}>{copy.focusRun.resume}</Text>
              </Pressable>
              <Pressable onPress={onMakeEasier} style={styles.secondaryButton}>
                <Text style={styles.secondaryText}>{copy.focusRun.easyVersion}</Text>
              </Pressable>
              <Pressable onPress={onLeaveAnyway} style={styles.leaveDanger}>
                <Text style={styles.leaveDangerText}>{copy.focusRun.leaveAnyway}</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#010101',
    padding: theme.spacing.xl,
    justifyContent: 'space-between',
  },
  chromeFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 180,
    backgroundColor: 'rgba(212,162,76,0.03)',
  },
  topBlock: {
    gap: theme.spacing.sm,
  },
  eyebrow: {
    color: theme.colors.accent,
    fontSize: theme.typography.meta,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  statusPill: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  statusPillText: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.meta,
    fontWeight: '800',
    letterSpacing: 1,
  },
  windowText: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.meta,
    fontWeight: '700',
    letterSpacing: 1,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.display,
    lineHeight: 40,
    fontWeight: '700',
  },
  commitLine: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    lineHeight: 23,
    fontWeight: '600',
  },
  lockLine: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  liveShell: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceAlt,
    padding: 2,
  },
  timerShell: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
    ...theme.shadow.gold,
  },
  timerLabel: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.meta,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  timerValue: {
    color: theme.colors.text,
    fontSize: 54,
    fontWeight: '800',
  },
  progressBar: {
    height: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceMuted,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.accent,
  },
  prestart: {
    gap: theme.spacing.md,
  },
  commitCard: {
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  commitCardLabel: {
    color: theme.colors.accent,
    fontSize: theme.typography.meta,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  activeState: {
    gap: theme.spacing.lg,
  },
  stepLabel: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.meta,
    fontWeight: '700',
    letterSpacing: 1,
  },
  stepText: {
    color: theme.colors.text,
    fontSize: theme.typography.h1,
    lineHeight: 34,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  primaryButton: {
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.accent,
    paddingVertical: 18,
    alignItems: 'center',
    ...theme.shadow.gold,
  },
  primaryButtonCompact: {
    flex: 1,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.accent,
    paddingVertical: 16,
    alignItems: 'center',
    ...theme.shadow.gold,
  },
  primaryText: {
    color: '#120b03',
    fontSize: theme.typography.body,
    fontWeight: '900',
  },
  secondaryButton: {
    flex: 1,
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
  scoreState: {
    gap: theme.spacing.md,
  },
  completedTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.h1,
    fontWeight: '700',
  },
  completedBody: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  scorePrompt: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  scoreRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  scoreChip: {
    flex: 1,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surfaceAlt,
    alignItems: 'center',
    paddingVertical: 16,
  },
  scoreChipText: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: '800',
  },
  leaveCard: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surfaceAlt,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  leaveTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.h2,
    fontWeight: '700',
  },
  leaveBody: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  leaveHint: {
    color: theme.colors.accent,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  leaveActions: {
    gap: theme.spacing.sm,
  },
  leaveDanger: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(234,124,143,0.28)',
    backgroundColor: 'rgba(234,124,143,0.08)',
    paddingVertical: 16,
    alignItems: 'center',
  },
  leaveDangerText: {
    color: theme.colors.danger,
    fontSize: theme.typography.body,
    fontWeight: '800',
  },
});
