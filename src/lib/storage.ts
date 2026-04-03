import AsyncStorage from '@react-native-async-storage/async-storage';

import { AppData, Category, DecisionRecord } from '../types';
import { inferDirectionFromSystem } from './directionEngine';
import { toLocalDateKey } from './entitlements';

const STORAGE_KEY = 'decido-now.app-data.v1';
const LEGACY_STORAGE_KEYS = ['karar10.app-data.v1'];

export function createDefaultAppData(now = new Date()): AppData {
  const todayKey = toLocalDateKey(now);

  return {
    decisions: [],
    skipLedger: {
      dateKey: todayKey,
      used: 0,
    },
    devPlanPreview: 'free',
    language: 'en',
    subscription: {
      plan: 'free',
      productId: null,
      status: 'inactive',
      source: 'none',
      lastSyncedAt: null,
    },
    onboardingDone: false,
    onboardingCompletedAt: null,
    firstActivatedAt: now.toISOString(),
    currentDirection: 'mind',
    currentDirectionChosenAt: null,
    currentSystem: 'learn',
    usage: {
      dateKey: todayKey,
      movesUsed: 0,
      swapsUsed: 0,
      focusRunsStarted: 0,
      recoveriesUsed: 0,
      paywallSeen: false,
      softPaywallSeenAt: null,
      hardPaywallSeenAt: null,
    },
    persona: null,
    dnaScores: {
      efficiency: 0,
      intuition: 0,
    },
    analytics: {
      firstOpenAt: now.toISOString(),
      lastOpenAt: null,
      firstCompletionAt: null,
      events: [],
    },
    notifications: {
      permission: 'unknown',
      lastPermissionRequestedAt: null,
      lastPermissionResolvedAt: null,
      lastRecallMoveId: null,
      lastRecallAt: null,
      lastRecallNotificationId: null,
      lastStreakSaverDateKey: null,
      lastStreakSaverScheduledAt: null,
      lastStreakSaverNotificationId: null,
      lastRecoveryDateKey: null,
      lastRecoveryScheduledAt: null,
      lastRecoveryNotificationId: null,
    },
    streakFreeze: {
      credits: 1,
      savedDateKeys: [],
      lastProtectedDateKey: null,
    },
    gifting: {
      sentCodes: [],
      earnedXp: 0,
      lastReceivedCode: null,
    },
    recovery: {
      lastRecoveryPromptAt: null,
      lastRecoveryCompletedAt: null,
      lastRecoverySource: null,
      triggeredCount: 0,
      completedCount: 0,
      abandonedCount: 0,
    },
  };
}

export async function loadAppData() {
  try {
    let stored = await AsyncStorage.getItem(STORAGE_KEY);

    if (!stored) {
      for (const legacyKey of LEGACY_STORAGE_KEYS) {
        const legacyValue = await AsyncStorage.getItem(legacyKey);
        if (legacyValue) {
          stored = legacyValue;
          await AsyncStorage.setItem(STORAGE_KEY, legacyValue);
          break;
        }
      }
    }

    if (!stored) {
      return createDefaultAppData();
    }

    const parsed = JSON.parse(stored) as Partial<AppData>;
    return normalizeAppData(parsed);
  } catch {
    return createDefaultAppData();
  }
}

export async function saveAppData(data: AppData) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function normalizeAppData(raw: Partial<AppData>, now = new Date()): AppData {
  const defaults = createDefaultAppData(now);
  const dateKey = toLocalDateKey(now);
  const parsedDecisions = (raw.decisions ?? []).map(normalizeDecision);
  const todayDecisions = parsedDecisions.filter((decision) => decision.dateKey === dateKey);

  const firstMeaningfulStart =
    raw.onboardingCompletedAt ??
    raw.firstActivatedAt ??
    raw.analytics?.firstOpenAt ??
    parsedDecisions.at(-1)?.createdAt ??
    defaults.firstActivatedAt;

  const onboardingCompletedAt =
    raw.onboardingCompletedAt ??
    (raw.onboardingDone ? firstMeaningfulStart : null);

  const usageIsToday = raw.usage?.dateKey === dateKey;

  return {
    ...defaults,
    ...raw,
    decisions: parsedDecisions,
    onboardingDone: raw.onboardingDone ?? defaults.onboardingDone,
    onboardingCompletedAt,
    firstActivatedAt: raw.firstActivatedAt ?? firstMeaningfulStart,
    currentDirection:
      raw.currentDirection ??
      inferDirectionFromSystem(raw.currentSystem ?? defaults.currentSystem),
    currentDirectionChosenAt: raw.currentDirectionChosenAt ?? raw.onboardingCompletedAt ?? null,
    usage: {
      ...defaults.usage,
      ...(raw.usage ?? {}),
      dateKey,
      movesUsed: usageIsToday
        ? raw.usage?.movesUsed ?? raw.usage?.swapsUsed ?? todayDecisions.length
        : 0,
      swapsUsed: usageIsToday ? raw.usage?.swapsUsed ?? 0 : 0,
      focusRunsStarted: usageIsToday
        ? raw.usage?.focusRunsStarted ?? raw.usage?.movesUsed ?? todayDecisions.length
        : 0,
      recoveriesUsed: usageIsToday ? raw.usage?.recoveriesUsed ?? 0 : 0,
      paywallSeen: usageIsToday ? raw.usage?.paywallSeen ?? false : false,
      softPaywallSeenAt: usageIsToday ? raw.usage?.softPaywallSeenAt ?? null : null,
      hardPaywallSeenAt: usageIsToday ? raw.usage?.hardPaywallSeenAt ?? null : null,
    },
    analytics: {
      ...defaults.analytics,
      ...(raw.analytics ?? {}),
      events: raw.analytics?.events ?? [],
    },
    notifications: {
      ...defaults.notifications,
      ...(raw.notifications ?? {}),
    },
    streakFreeze: {
      ...defaults.streakFreeze,
      ...(raw.streakFreeze ?? {}),
    },
    gifting: {
      ...defaults.gifting,
      ...(raw.gifting ?? {}),
    },
    recovery: {
      ...defaults.recovery,
      ...(raw.recovery ?? {}),
    },
    subscription: {
      ...defaults.subscription,
      ...(raw.subscription ?? {}),
    },
    dnaScores: {
      ...defaults.dnaScores,
      ...(raw.dnaScores ?? {}),
    },
  };
}

function normalizeDecision(decision: DecisionRecord): DecisionRecord {
  const category = decision.selectedSuggestion.category;

  return {
    ...decision,
    context: {
      ...decision.context,
      goal: decision.context.goal ?? inferGoal(category),
      friction: decision.context.friction ?? inferFriction(category),
    },
    isRecoveryMove: decision.isRecoveryMove ?? false,
    swapCountBeforeSelection: decision.swapCountBeforeSelection ?? 0,
    focusRunOutcome:
      decision.focusRunOutcome ??
      (decision.completion === 'done'
        ? 'completed'
        : decision.completion === 'partial'
          ? 'partial'
          : decision.completion === 'skipped'
            ? 'abandoned'
            : null),
  };
}

function inferGoal(category: Category) {
  switch (category) {
    case 'health':
    case 'reset':
      return 'reset';
    case 'social':
      return 'connect';
    case 'money':
    case 'earn':
      return 'earn';
    case 'learn':
    case 'language':
      return 'learn';
    case 'growth':
      return 'build';
    default:
      return 'finish';
  }
}

function inferFriction(category: Category) {
  switch (category) {
    case 'health':
    case 'reset':
      return 'tired';
    case 'money':
    case 'earn':
      return 'anxious';
    case 'social':
      return 'avoidant';
    case 'learn':
    case 'language':
      return 'unclear';
    default:
      return 'distracted';
  }
}
