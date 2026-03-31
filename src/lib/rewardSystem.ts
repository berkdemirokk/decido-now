import { CompletionState, DecisionRecord, SupportedLanguage } from '../types';

const LEVELS = [
  { name: 'Beginner', minXp: 0 },
  { name: 'Builder', minXp: 120 },
  { name: 'Machine', minXp: 320 },
] as const;

export interface RewardProfile {
  xp: number;
  level: string;
  nextLevel: string | null;
  progressPct: number;
  momentumLine: string;
}

export interface RewardResult {
  xpGain: number;
  levelBefore: string;
  levelAfter: string;
  message: string;
}

export function buildRewardProfile(
  decisions: DecisionRecord[],
  language: SupportedLanguage
): RewardProfile {
  const xp = decisions
    .filter((decision) => decision.reviewedAt)
    .reduce((sum, decision) => sum + getDecisionXp(decision.completion, decision.resultScore), 0);

  const currentLevelIndex = getCurrentLevelIndex(xp);
  const currentLevel = LEVELS[currentLevelIndex];
  const nextLevel = LEVELS[currentLevelIndex + 1] ?? null;
  const currentFloor = currentLevel.minXp;
  const nextFloor = nextLevel?.minXp ?? currentFloor + 140;
  const progressPct = Math.max(
    0,
    Math.min(1, (xp - currentFloor) / Math.max(1, nextFloor - currentFloor))
  );
  const strongCount = decisions.filter((decision) => (decision.resultScore ?? 0) >= 4).length;

  return {
    xp,
    level: currentLevel.name,
    nextLevel: nextLevel?.name ?? null,
    progressPct,
    momentumLine:
      language === 'tr'
        ? strongCount >= 5
          ? 'Son kapanislarda momentum net sekilde birikiyor.'
          : 'Skorlanan her hamle sistemi ve ritmini daha sert okutur.'
        : strongCount >= 5
          ? 'Your recent closes are stacking visible momentum.'
          : 'Every scored move sharpens both the system and your rhythm.',
  };
}

export function buildRewardResult(
  beforeDecisions: DecisionRecord[],
  completion: CompletionState,
  resultScore: 1 | 2 | 3 | 4 | 5,
  language: SupportedLanguage
): RewardResult {
  const beforeXp = beforeDecisions
    .filter((decision) => decision.reviewedAt)
    .reduce((sum, decision) => sum + getDecisionXp(decision.completion, decision.resultScore), 0);
  const xpGain = getDecisionXp(completion, resultScore);
  const afterXp = beforeXp + xpGain;
  const levelBefore = LEVELS[getCurrentLevelIndex(beforeXp)].name;
  const levelAfter = LEVELS[getCurrentLevelIndex(afterXp)].name;

  return {
    xpGain,
    levelBefore,
    levelAfter,
    message:
      language === 'tr'
        ? completion === 'done'
          ? 'Bugun korundu. Temiz bir hamle kapattin.'
          : completion === 'partial'
            ? 'Tam kapanmadi ama bugun hala toparlanabilir.'
            : 'Bugun kaydi. En hizli cikis akilli bir toparlanma hamlesi.'
        : completion === 'done'
          ? 'Today is secured. You closed a clean move.'
          : completion === 'partial'
            ? 'It did not fully close, but the day can still be salvaged.'
            : 'This one slipped. The fastest path now is a smart recovery move.',
  };
}

export function getDecisionXp(
  completion: CompletionState | null,
  resultScore: 1 | 2 | 3 | 4 | 5 | null
) {
  if (!completion || !resultScore) return 0;

  if (completion === 'done') {
    return 24 + resultScore * 6;
  }

  if (completion === 'partial') {
    return 10 + resultScore * 4;
  }

  return 0;
}

function getCurrentLevelIndex(xp: number) {
  let index = 0;
  for (let i = 0; i < LEVELS.length; i += 1) {
    if (xp >= LEVELS[i].minXp) {
      index = i;
    }
  }
  return index;
}

