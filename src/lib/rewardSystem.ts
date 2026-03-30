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
          ? 'Son hamlelerde momentum birikiyor.'
          : 'Skorlanan her hamle DNA ve momentumunu guclendirir.'
        : strongCount >= 5
          ? 'Your recent moves are stacking visible momentum.'
          : 'Every scored move strengthens your DNA and momentum.',
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
          ? 'Temiz bir hamle kapattin. Sistem artik seni daha keskin okuyacak.'
          : completion === 'partial'
            ? 'Kismi ilerleme bile ritmi korur. Yarin daha sert donebilirsin.'
            : 'Bugun kapanmadi. Yarin daha hafif ama daha akilli bir giris acacagiz.'
        : completion === 'done'
          ? 'You closed a clean move. The system can now sharpen around you faster.'
          : completion === 'partial'
            ? 'Partial progress still protects the rhythm.'
            : 'This one did not close. Tomorrow we open with a lighter, smarter recovery move.',
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
