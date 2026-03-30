import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppData, Category, DecisionRecord } from '../types';
import { getTodayKey } from './decisionEngine';

const STORAGE_KEY = 'decido-now.app-data.v1';
const LEGACY_STORAGE_KEYS = ['karar10.app-data.v1'];

export function createDefaultAppData(): AppData {
  return {
    decisions: [],
    skipLedger: {
      dateKey: getTodayKey(),
      used: 0,
    },
    devPlanPreview: 'free',
    language: 'tr',
    subscription: {
      plan: 'free',
      productId: null,
      status: 'inactive',
      source: 'none',
      lastSyncedAt: null,
    },
    onboardingDone: false,
    currentSystem: 'decide',
    usage: {
      dateKey: getTodayKey(),
      swapsUsed: 0,
      paywallSeen: false,
    },
    persona: null,
    dnaScores: {
      efficiency: 0,
      intuition: 0,
    },
    analytics: {
      firstOpenAt: new Date().toISOString(),
      lastOpenAt: null,
      firstCompletionAt: null,
      events: [],
    },
    notifications: {
      permission: 'unknown',
      lastRecallMoveId: null,
      lastRecallAt: null,
      lastStreakSaverDateKey: null,
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

    const parsed = JSON.parse(stored) as AppData;

    return {
      ...createDefaultAppData(),
      ...parsed,
      decisions: (parsed.decisions ?? []).map(normalizeDecision),
      usage: {
        ...createDefaultAppData().usage,
        ...(parsed.usage ?? {}),
      },
      notifications: {
        ...createDefaultAppData().notifications,
        ...(parsed.notifications ?? {}),
      },
      analytics: {
        ...createDefaultAppData().analytics,
        ...(parsed.analytics ?? {}),
      },
      streakFreeze: {
        ...createDefaultAppData().streakFreeze,
        ...(parsed.streakFreeze ?? {}),
      },
      gifting: {
        ...createDefaultAppData().gifting,
        ...(parsed.gifting ?? {}),
      },
    };
  } catch {
    return createDefaultAppData();
  }
}

export async function saveAppData(data: AppData) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
