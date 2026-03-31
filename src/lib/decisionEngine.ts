import { DAILY_SPARKS, SUGGESTIONS } from '../data/suggestions';
import {
  BudgetTier,
  Category,
  CategoryFilter,
  DecisionContext,
  DecisionRecord,
  Energy,
  Friction,
  Goal,
  Mode,
  PlanTier,
  Suggestion,
} from '../types';
import { toLocalDateKey } from './entitlements';

export const MODE_OPTIONS: Array<{ key: Mode; label: string; hint: string }> = [
  { key: 'stuck', label: 'Tikandim', hint: 'Baslamak zor geliyorsa' },
  { key: 'quick-win', label: 'Hizli Kazanc', hint: 'Kisa bir ilerleme istiyorsan' },
  { key: 'deep-focus', label: 'Derin Odak', hint: 'Tek ise girmek istiyorsan' },
  { key: 'reset', label: 'Reset', hint: 'Toparlanmak istiyorsan' },
  { key: 'bold', label: 'Cesur Mod', hint: 'Erteledigine dokunmak istiyorsan' },
];

export const GOAL_OPTIONS: Array<{ key: Goal; label: string; hint: string }> = [
  { key: 'finish', label: 'Bitir', hint: 'Yarim kalan isi kapat' },
  { key: 'learn', label: 'Ogren', hint: 'Bilgi ya da dil gelistir' },
  { key: 'earn', label: 'Kazan', hint: 'Gelir veya para akisini guclendir' },
  { key: 'build', label: 'Uret', hint: 'Fikir ya da proje ilerlet' },
  { key: 'connect', label: 'Bag kur', hint: 'Birine ulas ya da iliskiyi isit' },
  { key: 'reset', label: 'Toparlan', hint: 'Zihni ve bedeni rahatlat' },
];

export const FRICTION_OPTIONS: Array<{ key: Friction; label: string; hint: string }> = [
  { key: 'unclear', label: 'Belirsiz', hint: 'Ne yapacagim net degil' },
  { key: 'distracted', label: 'Daginik', hint: 'Dikkatim dagilip duruyor' },
  { key: 'tired', label: 'Yorgun', hint: 'Enerjim tasimiyor' },
  { key: 'anxious', label: 'Kaygili', hint: 'Yanlis yapmaktan cekiniyorum' },
  { key: 'avoidant', label: 'Kaciniyorum', hint: 'Biliyorum ama dokunmak istemiyorum' },
];

export const ENERGY_OPTIONS: Array<{ key: Energy; label: string }> = [
  { key: 'low', label: 'Dusuk' },
  { key: 'mid', label: 'Orta' },
  { key: 'high', label: 'Yuksek' },
];

export const TIME_OPTIONS = [5, 10, 15, 20, 30, 45];

export const BUDGET_OPTIONS: Array<{ key: BudgetTier; label: string }> = [
  { key: 'free', label: '0 TL' },
  { key: 'low', label: 'Dusuk' },
  { key: 'medium', label: 'Esnek' },
];

export const CATEGORY_OPTIONS: Array<{ key: CategoryFilter; label: string }> = [
  { key: 'mixed', label: 'Karisik' },
  { key: 'focus', label: 'Odak' },
  { key: 'health', label: 'Beden' },
  { key: 'learn', label: 'Ogren' },
  { key: 'language', label: 'Dil' },
  { key: 'earn', label: 'Gelir' },
  { key: 'money', label: 'Para' },
  { key: 'social', label: 'Sosyal' },
  { key: 'reset', label: 'Reset' },
  { key: 'growth', label: 'Gelisim' },
];

export const PLAN_LIMITS: Record<PlanTier, { dailyRequests: number; dailySkips: number }> = {
  free: { dailyRequests: 1, dailySkips: 1 },
  'pro-monthly': { dailyRequests: 999, dailySkips: 3 },
  'pro-yearly': { dailyRequests: 999, dailySkips: 5 },
  founding: { dailyRequests: 999, dailySkips: 7 },
};

export const CATEGORY_LABELS: Record<Category, string> = {
  focus: 'Odak',
  health: 'Beden',
  learn: 'Ogren',
  language: 'Dil',
  earn: 'Gelir',
  money: 'Para',
  social: 'Sosyal',
  reset: 'Reset',
  growth: 'Gelisim',
};

export const COMPLETION_LABELS = {
  done: 'Yapildi',
  partial: 'Kismi',
  skipped: 'Ertelendi',
};

const budgetRank: Record<BudgetTier, number> = {
  free: 0,
  low: 1,
  medium: 2,
};

const recentPenaltyWindow = 12;
const recentCategoryWindow = 6;

export function getTodayKey(date = new Date()) {
  return toLocalDateKey(date);
}

export function getDailySpark(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return DAILY_SPARKS[dayOfYear % DAILY_SPARKS.length];
}

export function countDailyRequests(decisions: DecisionRecord[], dateKey: string) {
  return decisions.filter((decision) => decision.dateKey === dateKey).length;
}

export function getRemainingRequests(decisions: DecisionRecord[], plan: PlanTier, dateKey: string) {
  const used = countDailyRequests(decisions, dateKey);
  const limit = PLAN_LIMITS[plan].dailyRequests;
  return Math.max(limit - used, 0);
}

export function canSkip(plan: PlanTier, dateKey: string, used: number) {
  if (dateKey !== getTodayKey()) {
    return PLAN_LIMITS[plan].dailySkips > 0;
  }

  return used < PLAN_LIMITS[plan].dailySkips;
}

export function pickSuggestions(context: DecisionContext, decisions: DecisionRecord[]) {
  const recentIds = decisions
    .slice(0, recentPenaltyWindow)
    .map((decision) => decision.selectedSuggestion.id);
  const recentCategories = decisions
    .slice(0, recentCategoryWindow)
    .map((decision) => decision.selectedSuggestion.category);
  const reviewed = decisions.filter((decision) => decision.reviewedAt);
  const learning = buildLearningModel(reviewed);
  const failureModel = buildFailureModel(reviewed);
  const currentDaypart = getDaypartKey(new Date().getHours());

  const ranked = SUGGESTIONS.map((suggestion) => ({
    suggestion,
    score: scoreSuggestion(
      suggestion,
      context,
      recentIds,
      recentCategories,
      learning,
      failureModel,
      currentDaypart
    ),
  }))
    .sort((left, right) => right.score - left.score)
    .filter((entry) => entry.score > 0);

  const picks: Suggestion[] = [];

  for (const entry of ranked) {
    const duplicateCategory =
      context.category === 'mixed' &&
      picks.some((suggestion) => suggestion.category === entry.suggestion.category);

    if (duplicateCategory && ranked.length - picks.length > 3) {
      continue;
    }

    picks.push(entry.suggestion);

    if (picks.length === 3) {
      break;
    }
  }

  const finalPicks = picks.length === 3 ? picks : ranked.slice(0, 3).map((entry) => entry.suggestion);

  if (!finalPicks.length) {
    const fallback = SUGGESTIONS.filter((suggestion) => {
      if (context.category !== 'mixed' && suggestion.category !== context.category) return false;
      return suggestion.energies.includes(context.energy);
    }).slice(0, 3);

    return fallback.length ? fallback : SUGGESTIONS.slice(0, 3);
  }

  return diversifyPicks(finalPicks, reviewed);
}

function scoreSuggestion(
  suggestion: Suggestion,
  context: DecisionContext,
  recentIds: string[],
  recentCategories: Category[],
  learning: LearningModel,
  failureModel: FailureModel,
  currentDaypart: string
) {
  let score = 0;
  const suggestionGoals = getSuggestionGoals(suggestion);
  const suggestionFrictions = getSuggestionFrictions(suggestion);

  if (context.category === suggestion.category) {
    score += 8;
  } else if (context.category === 'mixed') {
    score += 2;
  } else {
    score -= 3;
  }

  if (suggestion.preferredModes.includes(context.mode)) {
    score += 5;
  }

  if (suggestion.energies.includes(context.energy)) {
    score += 4;
  }

  if (suggestionGoals.includes(context.goal)) {
    score += 5;
  } else {
    score -= 1;
  }

  if (suggestionFrictions.includes(context.friction)) {
    score += 4;
  }

  const timeDistance = Math.abs(context.minutes - suggestion.minutes);
  score += Math.max(0, 5 - Math.floor(timeDistance / 5));

  const fitsBudget = suggestion.budget.some(
    (budget) => budgetRank[budget] <= budgetRank[context.budget]
  );

  score += fitsBudget ? 4 : -8;

  if (context.friction === 'tired' && suggestion.minutes <= 10) {
    score += 2;
  }

  if (context.friction === 'distracted' && suggestion.category === 'focus') {
    score += 1.5;
  }

  if (context.goal === 'earn' && ['earn', 'money'].includes(suggestion.category)) {
    score += 2;
  }

  if (context.goal === 'learn' && ['learn', 'language', 'growth'].includes(suggestion.category)) {
    score += 2;
  }

  if (recentIds.includes(suggestion.id)) {
    score -= 6;
  }

  if (recentCategories.includes(suggestion.category)) {
    score -= 2;
  }

  score += learning.suggestionScores[suggestion.id] ?? 0;
  score += learning.categoryScores[suggestion.category] ?? 0;
  score += learning.goalScores[context.goal] ?? 0;
  score += learning.frictionScores[context.friction] ?? 0;
  score += learning.modeScores[context.mode] ?? 0;
  score += learning.energyScores[context.energy] ?? 0;
  score += learning.budgetScores[context.budget] ?? 0;
  score += learning.timeBucketScores[getTimeBucket(suggestion.minutes)] ?? 0;
  score += learning.daypartScores[currentDaypart] ?? 0;
  score += learning.goalCategoryScores[getComboKey(context.goal, suggestion.category)] ?? 0;
  score +=
    learning.frictionCategoryScores[getComboKey(context.friction, suggestion.category)] ?? 0;
  score += learning.modeCategoryScores[getComboKey(context.mode, suggestion.category)] ?? 0;
  score += learning.energyCategoryScores[getComboKey(context.energy, suggestion.category)] ?? 0;
  score += failureModel.categoryPenalty[suggestion.category] ?? 0;
  score += failureModel.suggestionPenalty[suggestion.id] ?? 0;
  score += failureModel.timePenalty[getTimeBucket(suggestion.minutes)] ?? 0;
  score += failureModel.swapPenalty[(suggestion.minutes <= 10 ? 'short' : 'long')] ?? 0;

  if (failureModel.recentAbandonCount >= 2 && suggestion.minutes > 15) {
    score -= 1.8;
  }

  if (failureModel.swapHeavyCount >= 2 && suggestion.minutes <= 10) {
    score += 1.3;
  }

  if (failureModel.categorySuccess[suggestion.category] >= 2) {
    score += 1.1;
  }

  return score;
}

interface FailureModel {
  categoryPenalty: Record<string, number>;
  suggestionPenalty: Record<string, number>;
  categorySuccess: Record<string, number>;
  timePenalty: Record<string, number>;
  swapPenalty: Record<string, number>;
  recentAbandonCount: number;
  swapHeavyCount: number;
}

interface LearningModel {
  suggestionScores: Record<string, number>;
  categoryScores: Record<string, number>;
  goalScores: Record<string, number>;
  frictionScores: Record<string, number>;
  modeScores: Record<string, number>;
  energyScores: Record<string, number>;
  budgetScores: Record<string, number>;
  timeBucketScores: Record<string, number>;
  daypartScores: Record<string, number>;
  goalCategoryScores: Record<string, number>;
  frictionCategoryScores: Record<string, number>;
  modeCategoryScores: Record<string, number>;
  energyCategoryScores: Record<string, number>;
}

function buildLearningModel(decisions: DecisionRecord[]): LearningModel {
  const model: LearningModel = {
    suggestionScores: {},
    categoryScores: {},
    goalScores: {},
    frictionScores: {},
    modeScores: {},
    energyScores: {},
    budgetScores: {},
    timeBucketScores: {},
    daypartScores: {},
    goalCategoryScores: {},
    frictionCategoryScores: {},
    modeCategoryScores: {},
    energyCategoryScores: {},
  };

  for (const decision of decisions) {
    const contribution = getDecisionContribution(decision);
    const category = decision.selectedSuggestion.category;

    addWeightedScore(model.suggestionScores, decision.selectedSuggestion.id, contribution * 1.4);
    addWeightedScore(model.categoryScores, category, contribution * 0.95);
    addWeightedScore(model.goalScores, decision.context.goal, contribution * 0.8);
    addWeightedScore(model.frictionScores, decision.context.friction, contribution * 0.8);
    addWeightedScore(model.modeScores, decision.context.mode, contribution * 0.7);
    addWeightedScore(model.energyScores, decision.context.energy, contribution * 0.7);
    addWeightedScore(model.budgetScores, decision.context.budget, contribution * 0.5);
    addWeightedScore(
      model.timeBucketScores,
      getTimeBucket(decision.selectedSuggestion.minutes),
      contribution * 0.7
    );
    addWeightedScore(
      model.daypartScores,
      getDaypartKey(new Date(decision.createdAt).getHours()),
      contribution * 0.65
    );
    addWeightedScore(
      model.goalCategoryScores,
      getComboKey(decision.context.goal, category),
      contribution * 0.95
    );
    addWeightedScore(
      model.frictionCategoryScores,
      getComboKey(decision.context.friction, category),
      contribution * 0.85
    );
    addWeightedScore(
      model.modeCategoryScores,
      getComboKey(decision.context.mode, category),
      contribution * 0.8
    );
    addWeightedScore(
      model.energyCategoryScores,
      getComboKey(decision.context.energy, category),
      contribution * 0.7
    );
  }

  return normalizeModel(model);
}

function buildFailureModel(decisions: DecisionRecord[]): FailureModel {
  const recent = decisions.slice(0, 10);
  const categoryPenalty: Record<string, number> = {};
  const suggestionPenalty: Record<string, number> = {};
  const categorySuccess: Record<string, number> = {};
  const timePenalty: Record<string, number> = {};
  const swapPenalty: Record<string, number> = {};

  let recentAbandonCount = 0;
  let swapHeavyCount = 0;

  for (const decision of recent) {
    const category = decision.selectedSuggestion.category;
    const suggestionId = decision.selectedSuggestion.id;
    const bucket = getTimeBucket(decision.selectedSuggestion.minutes);

    if (decision.focusRunOutcome === 'abandoned' || decision.completion === 'skipped') {
      recentAbandonCount += 1;
      addWeightedScore(categoryPenalty, category, -1.8);
      addWeightedScore(suggestionPenalty, suggestionId, -2.4);
      addWeightedScore(timePenalty, bucket, bucket === 'long' ? -1.6 : -0.8);
    }

    if (decision.completion === 'partial') {
      addWeightedScore(categoryPenalty, category, -0.6);
      addWeightedScore(suggestionPenalty, suggestionId, -0.8);
    }

    if (decision.completion === 'done' && (decision.resultScore ?? 0) >= 4) {
      addWeightedScore(categorySuccess, category, 1.2);
      addWeightedScore(timePenalty, bucket, bucket === 'short' ? 0.8 : 0.3);
    }

    if ((decision.swapCountBeforeSelection ?? 0) > 1) {
      swapHeavyCount += 1;
      addWeightedScore(swapPenalty, decision.selectedSuggestion.minutes <= 10 ? 'short' : 'long', decision.completion === 'done' ? 0.4 : -0.9);
    }
  }

  return {
    categoryPenalty: clampRecord(categoryPenalty, 3),
    suggestionPenalty: clampRecord(suggestionPenalty, 3.5),
    categorySuccess: clampRecord(categorySuccess, 2),
    timePenalty: clampRecord(timePenalty, 2),
    swapPenalty: clampRecord(swapPenalty, 1.5),
    recentAbandonCount,
    swapHeavyCount,
  };
}

function addWeightedScore(bucket: Record<string, number>, key: string, value: number) {
  bucket[key] = (bucket[key] ?? 0) + value;
}

function getDecisionContribution(decision: DecisionRecord) {
  const completionWeight =
    decision.completion === 'done' ? 1 : decision.completion === 'partial' ? 0.35 : -0.7;
  const resultWeight = decision.resultScore ? (decision.resultScore - 3) * 0.4 : 0;
  return completionWeight + resultWeight;
}

function normalizeModel(model: LearningModel) {
  return {
    suggestionScores: clampRecord(model.suggestionScores, 3.6),
    categoryScores: clampRecord(model.categoryScores, 2.6),
    goalScores: clampRecord(model.goalScores, 1.9),
    frictionScores: clampRecord(model.frictionScores, 1.9),
    modeScores: clampRecord(model.modeScores, 1.8),
    energyScores: clampRecord(model.energyScores, 1.6),
    budgetScores: clampRecord(model.budgetScores, 1.4),
    timeBucketScores: clampRecord(model.timeBucketScores, 1.7),
    daypartScores: clampRecord(model.daypartScores, 1.6),
    goalCategoryScores: clampRecord(model.goalCategoryScores, 2.3),
    frictionCategoryScores: clampRecord(model.frictionCategoryScores, 2.1),
    modeCategoryScores: clampRecord(model.modeCategoryScores, 2),
    energyCategoryScores: clampRecord(model.energyCategoryScores, 1.8),
  };
}

function clampRecord(input: Record<string, number>, maxAbs: number) {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [key, Math.max(-maxAbs, Math.min(maxAbs, value))])
  );
}

function getComboKey(left: string, right: string) {
  return `${left}::${right}`;
}

function getSuggestionGoals(suggestion: Suggestion) {
  return suggestion.goals ?? inferGoalsFromCategory(suggestion.category);
}

function getSuggestionFrictions(suggestion: Suggestion) {
  return suggestion.frictions ?? inferFrictions(suggestion.category, suggestion.preferredModes);
}

function inferGoalsFromCategory(category: Category): Goal[] {
  switch (category) {
    case 'focus':
      return ['finish', 'build'];
    case 'health':
      return ['reset'];
    case 'learn':
      return ['learn', 'build'];
    case 'language':
      return ['learn', 'connect'];
    case 'earn':
      return ['earn', 'build'];
    case 'money':
      return ['earn', 'finish'];
    case 'social':
      return ['connect'];
    case 'reset':
      return ['reset'];
    case 'growth':
      return ['learn', 'build'];
  }
}

function inferFrictions(category: Category, preferredModes: Mode[]): Friction[] {
  const base: Friction[] = [];

  switch (category) {
    case 'focus':
      base.push('distracted', 'unclear');
      break;
    case 'health':
    case 'reset':
      base.push('tired');
      break;
    case 'money':
    case 'earn':
      base.push('anxious', 'avoidant');
      break;
    case 'social':
      base.push('avoidant', 'anxious');
      break;
    case 'learn':
    case 'language':
    case 'growth':
      base.push('unclear', 'avoidant');
      break;
  }

  if (preferredModes.includes('stuck')) {
    base.push('unclear');
  }

  if (preferredModes.includes('reset')) {
    base.push('tired');
  }

  if (preferredModes.includes('bold')) {
    base.push('avoidant');
  }

  return Array.from(new Set(base));
}

function getTimeBucket(minutes: number) {
  if (minutes <= 10) {
    return 'short';
  }

  if (minutes <= 20) {
    return 'medium';
  }

  return 'long';
}

function getDaypartKey(hour: number) {
  if (hour < 5) {
    return 'night';
  }

  if (hour < 12) {
    return 'morning';
  }

  if (hour < 18) {
    return 'afternoon';
  }

  return 'evening';
}

function diversifyPicks(picks: Suggestion[], reviewed: DecisionRecord[]) {
  return picks
    .map((suggestion, index) => ({
      suggestion,
      index,
      freshness: computeFreshnessBonus(suggestion, reviewed),
    }))
    .sort((left, right) => {
      const freshnessDiff = right.freshness - left.freshness;
      if (freshnessDiff !== 0) return freshnessDiff;
      return left.index - right.index;
    })
    .map((entry) => entry.suggestion);
}

function computeFreshnessBonus(suggestion: Suggestion, reviewed: DecisionRecord[]) {
  const lastSeenIndex = reviewed.findIndex(
    (decision) => decision.selectedSuggestion.id === suggestion.id
  );

  if (lastSeenIndex === -1) return 3;
  if (lastSeenIndex > 6) return 1.5;
  return 0;
}
