export type Mode =
  | 'stuck'
  | 'quick-win'
  | 'deep-focus'
  | 'reset'
  | 'bold';

export type Energy = 'low' | 'mid' | 'high';

export type BudgetTier = 'free' | 'low' | 'medium';

export type Goal = 'finish' | 'learn' | 'earn' | 'reset' | 'connect' | 'build';

export type Friction = 'unclear' | 'distracted' | 'tired' | 'anxious' | 'avoidant';

export type Category =
  | 'focus'
  | 'health'
  | 'money'
  | 'social'
  | 'reset'
  | 'growth'
  | 'learn'
  | 'language'
  | 'earn';

export type CategoryFilter = Category | 'mixed';

export type CompletionState = 'done' | 'partial' | 'skipped';

export type PlanTier = 'free' | 'pro-monthly' | 'pro-yearly' | 'founding';

export type SystemId = 'decide' | 'learn' | 'earn' | 'move' | 'reset';

export type AppTabKey = 'today' | 'systems' | 'progress' | 'settings';

export type PersonaArchetype =
  | 'the-perfectionist'
  | 'the-chaotic-achiever'
  | 'the-hesitant-pro';

export type SupportedLanguage =
  | 'tr'
  | 'en'
  | 'de'
  | 'fr'
  | 'es'
  | 'it'
  | 'pt'
  | 'nl'
  | 'pl'
  | 'sv'
  | 'da'
  | 'no'
  | 'fi'
  | 'ro'
  | 'cs';

export interface DecisionContext {
  mode: Mode;
  energy: Energy;
  minutes: number;
  budget: BudgetTier;
  category: CategoryFilter;
  goal: Goal;
  friction: Friction;
}

export interface Suggestion {
  id: string;
  title: string;
  action: string;
  reason: string;
  category: Category;
  preferredModes: Mode[];
  energies: Energy[];
  minutes: number;
  budget: BudgetTier[];
  goals?: Goal[];
  frictions?: Friction[];
}

export interface DecisionRecord {
  id: string;
  createdAt: string;
  dateKey: string;
  context: DecisionContext;
  options: Suggestion[];
  selectedSuggestion: Suggestion;
  completion: CompletionState | null;
  resultScore: 1 | 2 | 3 | 4 | 5 | null;
  reflection: string;
  reviewedAt: string | null;
  executionSeconds?: number | null;
  usedGuidance?: boolean;
}

export interface SkipLedger {
  dateKey: string;
  used: number;
}

export interface SubscriptionState {
  plan: PlanTier;
  productId: string | null;
  status: 'inactive' | 'active';
  source: 'app-store' | 'play-store' | 'manual' | 'none';
  lastSyncedAt: string | null;
}

export interface NotificationState {
  permission: 'unknown' | 'granted' | 'denied';
  lastRecallMoveId: string | null;
  lastRecallAt: string | null;
  lastStreakSaverDateKey: string | null;
}

export interface DailyUsage {
  dateKey: string;
  swapsUsed: number;
  paywallSeen: boolean;
}

export interface StreakFreezeState {
  credits: number;
  savedDateKeys: string[];
  lastProtectedDateKey: string | null;
}

export interface GiftMoveState {
  sentCodes: string[];
  earnedXp: number;
  lastReceivedCode: string | null;
}

export interface DecisionDnaScores {
  efficiency: number;
  intuition: number;
}

export interface AnalyticsEvent {
  id: string;
  name: string;
  createdAt: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface AnalyticsState {
  firstOpenAt: string;
  lastOpenAt: string | null;
  firstCompletionAt: string | null;
  events: AnalyticsEvent[];
}

export interface AppData {
  decisions: DecisionRecord[];
  skipLedger: SkipLedger;
  devPlanPreview: PlanTier;
  language: SupportedLanguage;
  subscription: SubscriptionState;
  onboardingDone: boolean;
  currentSystem: SystemId;
  usage: DailyUsage;
  persona: PersonaArchetype | null;
  dnaScores: DecisionDnaScores;
  analytics: AnalyticsState;
  notifications: NotificationState;
  streakFreeze: StreakFreezeState;
  gifting: GiftMoveState;
}

export interface InsightCard {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  metric: string;
}
