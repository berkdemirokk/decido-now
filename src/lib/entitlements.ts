import { AppData, DecisionRecord, PlanTier, UserAccessState, UserEntitlements } from '../types';

export const ACTIVATION_PHASE_DAYS = 7;
export const ACTIVATION_PHASE_CLEAN_CLOSES = 5;
const PREMIUM_MOVE_LIMIT = 999;
const PREMIUM_SWAP_LIMIT = 8;

export function toLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDateKeyOffset(offset: number, now = new Date()) {
  const date = new Date(now);
  date.setDate(date.getDate() + offset);
  return toLocalDateKey(date);
}

export function getStartOfLocalDay(date = new Date()) {
  const local = new Date(date);
  local.setHours(0, 0, 0, 0);
  return local;
}

export function isPremiumPlan(plan: PlanTier) {
  return plan !== 'free';
}

export function getActivationAnchor(appData: AppData) {
  return appData.onboardingCompletedAt ?? appData.firstActivatedAt ?? appData.analytics.firstOpenAt;
}

export function getActivationDay(appData: AppData, now = new Date()) {
  const anchor = getActivationAnchor(appData);
  if (!anchor) return null;
  const start = getStartOfLocalDay(new Date(anchor));
  const current = getStartOfLocalDay(now);
  const diffMs = current.getTime() - start.getTime();
  if (diffMs < 0) return 1;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
}

export function getActivationPhaseEndsAt(appData: AppData) {
  const anchor = getActivationAnchor(appData);
  if (!anchor) return null;
  const end = getStartOfLocalDay(new Date(anchor));
  end.setDate(end.getDate() + ACTIVATION_PHASE_DAYS);
  return end.toISOString();
}

export function isCleanClose(decision: DecisionRecord) {
  return (
    decision.completion === 'done' &&
    decision.focusRunOutcome !== 'abandoned' &&
    (decision.resultScore ?? 0) >= 4
  );
}

export function getCleanCloseCount(appData: AppData) {
  return appData.decisions.filter(isCleanClose).length;
}

export function isActivationPhase(appData: AppData, now = new Date()) {
  if (isPremiumPlan(appData.subscription.plan)) return false;
  const day = getActivationDay(appData, now);
  const cleanCloses = getCleanCloseCount(appData);
  return day !== null && day <= ACTIVATION_PHASE_DAYS && cleanCloses < ACTIVATION_PHASE_CLEAN_CLOSES;
}

export function buildEntitlements(appData: AppData, now = new Date()): UserEntitlements {
  if (isPremiumPlan(appData.subscription.plan)) {
    return {
      phase: 'premium',
      isActivationPhase: false,
      isPremium: true,
      moveLimit: PREMIUM_MOVE_LIMIT,
      swapLimit: PREMIUM_SWAP_LIMIT,
      focusRunLimit: PREMIUM_MOVE_LIMIT,
      guidanceTier: 'full',
      premiumInsights: true,
      premiumRecovery: true,
      streakProtection: true,
      advancedChallengeTracks: true,
    };
  }

  if (isActivationPhase(appData, now)) {
    return {
      phase: 'activation',
      isActivationPhase: true,
      isPremium: false,
      moveLimit: 4,
      swapLimit: 2,
      focusRunLimit: 4,
      guidanceTier: 'full',
      premiumInsights: false,
      premiumRecovery: false,
      streakProtection: false,
      advancedChallengeTracks: false,
    };
  }

  return {
    phase: 'free',
    isActivationPhase: false,
    isPremium: false,
    moveLimit: 2,
    swapLimit: 1,
    focusRunLimit: 2,
    guidanceTier: 'basic',
    premiumInsights: false,
    premiumRecovery: false,
    streakProtection: false,
    advancedChallengeTracks: false,
  };
}

export function getDailyMoveLimit(appData: AppData, now = new Date()) {
  return buildEntitlements(appData, now).moveLimit;
}

export function getDailySwapLimit(appData: AppData, now = new Date()) {
  return buildEntitlements(appData, now).swapLimit;
}

export function getGuidanceTier(appData: AppData, now = new Date()) {
  return buildEntitlements(appData, now).guidanceTier;
}

export function getUserAccessState(appData: AppData, now = new Date()): UserAccessState {
  const entitlements = buildEntitlements(appData, now);
  const dateKey = toLocalDateKey(now);
  const movesUsedToday = appData.usage.dateKey === dateKey ? appData.usage.movesUsed : 0;
  const swapsUsedToday = appData.usage.dateKey === dateKey ? appData.usage.swapsUsed : 0;
  const focusRunsStartedToday = appData.usage.dateKey === dateKey ? appData.usage.focusRunsStarted : 0;

  return {
    entitlements,
    activationDay: getActivationDay(appData, now),
    activationEndsAt: getActivationPhaseEndsAt(appData),
    movesUsedToday,
    swapsUsedToday,
    focusRunsStartedToday,
    movesRemaining: entitlements.isPremium
      ? PREMIUM_MOVE_LIMIT
      : Math.max(entitlements.moveLimit - movesUsedToday, 0),
    swapsRemaining: entitlements.isPremium
      ? PREMIUM_SWAP_LIMIT
      : Math.max(entitlements.swapLimit - swapsUsedToday, 0),
    hasHitMoveLimit: !entitlements.isPremium && movesUsedToday >= entitlements.moveLimit,
    hasHitSwapLimit: !entitlements.isPremium && swapsUsedToday >= entitlements.swapLimit,
  };
}

export function shouldResetUsage(appData: AppData, now = new Date()) {
  return appData.usage.dateKey !== toLocalDateKey(now);
}
