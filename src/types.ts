export type Mode = 'stuck' | 'quick-win' | 'deep-focus' | 'reset' | 'bold';

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

export type FocusRunOutcome = 'completed' | 'partial' | 'abandoned';

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

export type NotificationPermissionState = 'unknown' | 'granted' | 'denied';

export type GuidanceTier = 'basic' | 'full';

export type RecoveryTier = 'basic' | 'advanced';

export type PaywallMode = 'soft-success' | 'hard-access';

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
  isRecoveryMove?: boolean;
  swapCountBeforeSelection?: number;
  focusRunOutcome?: FocusRunOutcome | null;
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
  permission: NotificationPermissionState;
  lastPermissionRequestedAt: string | null;
  lastPermissionResolvedAt: string | null;
  lastRecallMoveId: string | null;
  lastRecallAt: string | null;
  lastRecallNotificationId: string | null;
  lastStreakSaverDateKey: string | null;
  lastStreakSaverScheduledAt: string | null;
  lastStreakSaverNotificationId: string | null;
  lastRecoveryDateKey: string | null;
  lastRecoveryScheduledAt: string | null;
  lastRecoveryNotificationId: string | null;
}

export interface DailyUsage {
  dateKey: string;
  movesUsed: number;
  swapsUsed: number;
  focusRunsStarted: number;
  recoveriesUsed: number;
  paywallSeen: boolean;
  softPaywallSeenAt: string | null;
  hardPaywallSeenAt: string | null;
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

export interface RecoveryState {
  lastRecoveryPromptAt: string | null;
  lastRecoveryCompletedAt: string | null;
  lastRecoverySource: 'abandon' | 'missed-day' | 'swap-fatigue' | null;
  triggeredCount: number;
  completedCount: number;
  abandonedCount: number;
}

export interface AppData {
  decisions: DecisionRecord[];
  skipLedger: SkipLedger;
  devPlanPreview: PlanTier;
  language: SupportedLanguage;
  subscription: SubscriptionState;
  onboardingDone: boolean;
  onboardingCompletedAt: string | null;
  firstActivatedAt: string | null;
  currentSystem: SystemId;
  usage: DailyUsage;
  persona: PersonaArchetype | null;
  dnaScores: DecisionDnaScores;
  analytics: AnalyticsState;
  notifications: NotificationState;
  streakFreeze: StreakFreezeState;
  gifting: GiftMoveState;
  recovery: RecoveryState;
}

export interface InsightCard {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  metric: string;
}

export interface UserEntitlements {
  phase: 'activation' | 'free' | 'premium';
  isActivationPhase: boolean;
  isPremium: boolean;
  moveLimit: number;
  swapLimit: number;
  focusRunLimit: number;
  guidanceTier: GuidanceTier;
  premiumInsights: boolean;
  premiumRecovery: boolean;
  streakProtection: boolean;
  advancedChallengeTracks: boolean;
}

export interface UserAccessState {
  entitlements: UserEntitlements;
  activationDay: number | null;
  activationEndsAt: string | null;
  movesUsedToday: number;
  swapsUsedToday: number;
  focusRunsStartedToday: number;
  movesRemaining: number;
  swapsRemaining: number;
  hasHitMoveLimit: boolean;
  hasHitSwapLimit: boolean;
}
