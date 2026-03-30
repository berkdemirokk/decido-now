import { BlurView } from 'expo-blur';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { UiCopy } from '../lib/uiCopy';
import { Energy, Friction, Goal } from '../types';
import { theme } from '../theme';

interface OnboardingScreenProps {
  copy: UiCopy;
  step: number;
  selectedGoal: Goal | null;
  selectedFriction: Friction | null;
  selectedMinutes: number | null;
  selectedEnergy: Energy | null;
  previewTitle?: string;
  onGoal: (value: Goal) => void;
  onFriction: (value: Friction) => void;
  onMinutes: (value: number) => void;
  onEnergy: (value: Energy) => void;
  onContinue: () => void;
  onStart: () => void;
  onWhy: () => void;
}

const goals: Array<{ value: Goal; label: string }> = [
  { value: 'finish', label: 'Clarity' },
  { value: 'learn', label: 'Learning' },
  { value: 'earn', label: 'Money' },
  { value: 'reset', label: 'Calm' },
  { value: 'build', label: 'Progress' },
];

const frictions: Array<{ value: Friction; label: string }> = [
  { value: 'unclear', label: 'Unclear' },
  { value: 'distracted', label: 'Distracted' },
  { value: 'tired', label: 'Tired' },
  { value: 'anxious', label: 'Anxious' },
  { value: 'avoidant', label: 'Avoiding' },
];

const times = [3, 10, 20];
const energies: Array<{ value: Energy; label: string }> = [
  { value: 'low', label: 'Low' },
  { value: 'mid', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export function OnboardingScreen(props: OnboardingScreenProps) {
  const { copy, step } = props;

  const renderQuestion = () => {
    if (step === 0) {
      return (
        <QuestionBlock
          title={copy.onboarding.goal}
          options={goals.map((item) => ({
            label: item.label,
            selected: props.selectedGoal === item.value,
            onPress: () => props.onGoal(item.value),
          }))}
        />
      );
    }

    if (step === 1) {
      return (
        <QuestionBlock
          title={copy.onboarding.blocker}
          options={frictions.map((item) => ({
            label: item.label,
            selected: props.selectedFriction === item.value,
            onPress: () => props.onFriction(item.value),
          }))}
        />
      );
    }

    if (step === 2) {
      return (
        <QuestionBlock
          title={copy.onboarding.time}
          options={times.map((value) => ({
            label: `${value} min`,
            selected: props.selectedMinutes === value,
            onPress: () => props.onMinutes(value),
          }))}
        />
      );
    }

    if (step === 3) {
      return (
        <QuestionBlock
          title={copy.onboarding.energy}
          options={energies.map((item) => ({
            label: item.label,
            selected: props.selectedEnergy === item.value,
            onPress: () => props.onEnergy(item.value),
          }))}
        />
      );
    }

    return (
      <View style={styles.reveal}>
        <Text style={styles.revealEyebrow}>READY</Text>
        <Text style={styles.revealTitle}>{copy.onboarding.reveal}</Text>
        <Text style={styles.revealBody}>{copy.onboarding.revealBody}</Text>
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>{props.previewTitle}</Text>
          <BlurView intensity={78} tint="dark" style={styles.proPreview}>
            <Text style={styles.proPreviewLabel}>PRO PREVIEW</Text>
            <Text style={styles.proPreviewText}>
              7-day projection, deeper DNA, and a sharper action map unlock after your first wins.
            </Text>
          </BlurView>
        </View>
        <View style={styles.revealButtons}>
          <Pressable onPress={props.onStart} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>{copy.onboarding.start}</Text>
          </Pressable>
          <Pressable onPress={props.onWhy} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>{copy.onboarding.why}</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>DECIDO NOW</Text>
      <Text style={styles.title}>{copy.onboarding.title}</Text>
      <Text style={styles.body}>{copy.onboarding.body}</Text>
      {renderQuestion()}
      {step < 4 ? (
        <Pressable onPress={props.onContinue} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>{copy.onboarding.continue}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function QuestionBlock({
  title,
  options,
}: {
  title: string;
  options: Array<{ label: string; selected: boolean; onPress: () => void }>;
}) {
  return (
    <View style={styles.questionBlock}>
      <Text style={styles.questionTitle}>{title}</Text>
      <View style={styles.options}>
        {options.map((option) => (
          <Pressable
            key={option.label}
            onPress={option.onPress}
            style={[styles.option, option.selected && styles.optionSelected]}
          >
            <Text style={[styles.optionText, option.selected && styles.optionTextSelected]}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
    justifyContent: 'center',
    gap: theme.spacing.lg,
  },
  brand: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.meta,
    fontWeight: '800',
    letterSpacing: 1.8,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.display,
    lineHeight: 40,
    fontWeight: '700',
  },
  body: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 24,
  },
  questionBlock: {
    gap: theme.spacing.md,
  },
  questionTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.h2,
    fontWeight: '700',
  },
  options: {
    gap: theme.spacing.sm,
  },
  option: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
    paddingVertical: 16,
    paddingHorizontal: theme.spacing.md,
  },
  optionSelected: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentSoft,
  },
  optionText: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: '600',
  },
  optionTextSelected: {
    color: theme.colors.accent,
  },
  primaryButton: {
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.accent,
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#1b1202',
    fontWeight: '800',
    fontSize: theme.typography.body,
  },
  reveal: {
    gap: theme.spacing.md,
  },
  revealEyebrow: {
    color: theme.colors.accent,
    fontSize: theme.typography.meta,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  revealTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.h1,
    fontWeight: '700',
  },
  revealBody: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
  },
  previewCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  previewTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.h2,
    fontWeight: '700',
  },
  proPreview: {
    overflow: 'hidden',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    backgroundColor: 'rgba(12,16,24,0.54)',
  },
  proPreviewLabel: {
    color: theme.colors.accent,
    fontSize: theme.typography.meta,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  proPreviewText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  revealButtons: {
    gap: theme.spacing.sm,
  },
  secondaryButton: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
});
