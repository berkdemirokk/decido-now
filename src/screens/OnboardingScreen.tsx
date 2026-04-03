import { useEffect, useLayoutEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { UiCopy } from '../lib/uiCopy';
import { Energy, Friction, Goal, GrowthDirectionId, SupportedLanguage } from '../types';
import { theme } from '../theme';

interface OnboardingScreenProps {
  copy: UiCopy;
  language: SupportedLanguage;
  step: number;
  selectedDirection: GrowthDirectionId | null;
  selectedFriction: Friction | null;
  selectedMinutes: number | null;
  selectedEnergy: Energy | null;
  previewTitle?: string | null;
  onDirection: (value: GrowthDirectionId) => void;
  onGoal?: (value: Goal) => void;
  onFriction: (value: Friction) => void;
  onMinutes: (value: number) => void;
  onEnergy: (value: Energy) => void;
  onContinue: () => void;
  onStart: () => void;
  onWhy: () => void;
}

const totalSteps = 4;

export function OnboardingScreen({
  copy,
  step,
  selectedDirection,
  selectedFriction,
  selectedEnergy,
  previewTitle,
  onDirection,
  onFriction,
  onMinutes,
  onEnergy,
  onContinue,
  onStart,
}: OnboardingScreenProps) {
  const visibleStep = getVisibleStep(step);
  const progress = Math.min(1, Math.max(0, visibleStep / totalSteps));
  const autoSkippedTimeStep = useRef(false);
  const canContinue =
    step === 0
      ? Boolean(selectedDirection)
      : step === 1
        ? Boolean(selectedFriction)
        : step === 2
          ? Boolean(selectedEnergy)
          : true;

  useEffect(() => {
    if (step !== 3) {
      autoSkippedTimeStep.current = false;
    }
  }, [step]);

  useLayoutEffect(() => {
    if (step !== 3 || autoSkippedTimeStep.current) {
      return;
    }

    autoSkippedTimeStep.current = true;
    onMinutes(inferMinutes(selectedEnergy, selectedFriction));
    onContinue();
  }, [onContinue, onMinutes, selectedEnergy, selectedFriction, step]);

  const stepContent = getStepContent(step, copy);

  return (
    <View style={styles.container}>
      <View style={styles.topBlock}>
        <Text style={styles.brand}>DECIDO NOW</Text>

        <View style={styles.progressMeta}>
          <Text style={styles.progressLabel}>{copy.onboarding.progressLabel(visibleStep, totalSteps)}</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.title}>{stepContent.title}</Text>
          <Text style={styles.body}>{stepContent.body}</Text>
        </View>
      </View>

      {step === 0 ? (
        <QuestionBlock>
          {copy.onboarding.directions.map((item) => (
            <Pressable
              key={item.value}
              onPress={() => onDirection(item.value)}
              style={[styles.cardOption, selectedDirection === item.value ? styles.cardOptionSelected : null]}
            >
              <Text style={[styles.cardTitle, selectedDirection === item.value ? styles.cardTitleSelected : null]}>
                {item.label}
              </Text>
              {item.body ? <Text style={styles.cardBody}>{item.body}</Text> : null}
            </Pressable>
          ))}
        </QuestionBlock>
      ) : null}

      {step === 1 ? (
        <QuestionBlock>
          <View style={styles.compactGrid}>
            {copy.onboarding.frictions.map((item) => (
              <Pressable
                key={item.value}
                onPress={() => onFriction(item.value)}
                style={[styles.compactOption, selectedFriction === item.value ? styles.optionSelected : null]}
              >
                <Text style={[styles.optionText, selectedFriction === item.value ? styles.optionTextSelected : null]}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </QuestionBlock>
      ) : null}

      {step === 2 ? (
        <QuestionBlock>
          <View style={styles.compactGrid}>
            {copy.onboarding.energies.map((item) => (
              <Pressable
                key={item.value}
                onPress={() => onEnergy(item.value)}
                style={[styles.compactOption, styles.tightOption, selectedEnergy === item.value ? styles.optionSelected : null]}
              >
                <Text style={[styles.optionText, selectedEnergy === item.value ? styles.optionTextSelected : null]}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </QuestionBlock>
      ) : null}

      {step === 4 ? (
        <View style={styles.reveal}>
          <Text style={styles.revealEyebrow}>{copy.onboarding.revealEyebrow}</Text>
          <Text style={styles.revealTitle}>{previewTitle ?? copy.onboarding.reveal}</Text>
          <Text style={styles.revealBody}>{copy.onboarding.steps.reveal.body}</Text>
          <Pressable onPress={onStart} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>{copy.onboarding.start}</Text>
          </Pressable>
        </View>
      ) : step !== 3 ? (
        <Pressable
          disabled={!canContinue}
          onPress={onContinue}
          style={[styles.primaryButton, !canContinue ? styles.primaryButtonDisabled : null]}
        >
          <Text style={styles.primaryButtonText}>{copy.onboarding.continue}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function QuestionBlock({
  children,
}: {
  children: React.ReactNode;
}) {
  return <View style={styles.questionBlock}>{children}</View>;
}

function getStepContent(step: number, copy: UiCopy) {
  switch (step) {
    case 0:
      return copy.onboarding.steps.direction;
    case 1:
      return copy.onboarding.steps.friction;
    case 2:
      return copy.onboarding.steps.energy;
    case 3:
      return copy.onboarding.steps.loading;
    default:
      return copy.onboarding.steps.reveal;
  }
}

function getVisibleStep(step: number) {
  if (step >= 4) {
    return 4;
  }

  if (step >= 2) {
    return 3;
  }

  return step + 1;
}

function inferMinutes(selectedEnergy: Energy | null, selectedFriction: Friction | null) {
  if (selectedEnergy === 'low' || selectedFriction === 'tired') {
    return 5;
  }

  if (selectedEnergy === 'high' && selectedFriction !== 'anxious' && selectedFriction !== 'avoidant') {
    return 20;
  }

  return 10;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.lg,
    backgroundColor: 'transparent',
  },
  topBlock: {
    gap: theme.spacing.md,
  },
  brand: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.meta,
    fontWeight: '900',
    letterSpacing: 1.8,
  },
  progressMeta: {
    gap: 8,
  },
  progressLabel: {
    color: theme.colors.textSoft,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: theme.colors.accent,
  },
  hero: {
    gap: 8,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.display,
    lineHeight: 40,
    fontWeight: '800',
    letterSpacing: -0.9,
  },
  body: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
    fontWeight: '500',
    maxWidth: 340,
  },
  questionBlock: {
    gap: theme.spacing.sm,
  },
  compactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  compactOption: {
    minWidth: '47%',
    flexGrow: 1,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 16,
  },
  tightOption: {
    minWidth: '30%',
  },
  optionSelected: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentSoft,
  },
  optionText: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: '700',
    textAlign: 'center',
  },
  optionTextSelected: {
    color: theme.colors.accent,
  },
  cardOption: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 18,
    gap: 6,
  },
  cardOptionSelected: {
    borderColor: theme.colors.accent,
    backgroundColor: 'rgba(199,168,103,0.08)',
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.h2,
    fontWeight: '800',
  },
  cardTitleSelected: {
    color: theme.colors.accent,
  },
  cardBody: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  primaryButton: {
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: '900',
  },
  reveal: {
    gap: theme.spacing.md,
  },
  revealEyebrow: {
    color: theme.colors.accent,
    fontSize: theme.typography.meta,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  revealTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.h1,
    fontWeight: '800',
    lineHeight: 34,
  },
  revealBody: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
    maxWidth: 320,
  },
});
