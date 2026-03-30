import { DecisionDnaScores } from '../types';

export function updateDecisionDnaScores(
  current: DecisionDnaScores,
  estimatedSeconds: number,
  actualSeconds: number,
  usedGuidance: boolean
): DecisionDnaScores {
  const next: DecisionDnaScores = { ...current };

  if (actualSeconds > 0 && actualSeconds < estimatedSeconds) {
    next.efficiency = Math.min(100, next.efficiency + 6);
  } else {
    next.efficiency = Math.min(100, next.efficiency + 2);
  }

  if (!usedGuidance) {
    next.intuition = Math.min(100, next.intuition + 5);
  } else {
    next.intuition = Math.min(100, next.intuition + 1);
  }

  return next;
}
