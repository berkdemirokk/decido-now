import { AnalyticsState } from '../types';

export const ANALYTICS_EVENTS = {
  appOpen: 'app_open',
  onboardingComplete: 'onboarding_complete',
  activationMoveShown: 'activation_move_shown',
  firstMoveShown: 'first_move_shown',
  firstMoveStarted: 'first_move_started',
  firstMoveCompleted: 'first_move_completed',
  moveShown: 'move_shown',
  moveStarted: 'move_started',
  moveCompleted: 'move_completed',
  moveSkipped: 'move_skipped',
  moveLimitHit: 'move_limit_hit',
  swapUsed: 'swap_used',
  swapLimitHit: 'swap_limit_hit',
  guidanceOpened: 'guidance_opened',
  premiumGuidanceGateViewed: 'premium_guidance_gate_viewed',
  focusRunStarted: 'focus_run_started',
  focusRunCompleted: 'focus_run_completed',
  focusRunAbandoned: 'focus_run_abandoned',
  focusRunPartial: 'focus_run_partial',
  recoveryTriggered: 'recovery_triggered',
  recoveryCompleted: 'recovery_completed',
  recoveryPromptSeen: 'recovery_prompt_seen',
  recoveryAccepted: 'recovery_accepted',
  streakSaverStarted: 'streak_saver_started',
  streakSaverUsed: 'streak_saver_used',
  softPaywallViewed: 'soft_paywall_viewed',
  hardPaywallViewed: 'hard_paywall_viewed',
  premiumGateSeen: 'premium_gate_seen',
  purchaseStarted: 'purchase_started',
  purchaseCompleted: 'purchase_completed',
  rewardViewed: 'reward_viewed',
  notificationPermissionRequested: 'notification_permission_requested',
  notificationPermissionGranted: 'notification_permission_granted',
  notificationPermissionDenied: 'notification_permission_denied',
  notificationScheduled: 'notification_scheduled',
  notificationOpened: 'notification_opened',
  shareOpened: 'share_opened',
  shareSent: 'share_sent',
  shareVariantOpened: 'share_variant_opened',
  shareVariantUsed: 'share_variant_used',
  giftMoveSent: 'gift_move_sent',
  giftRedeemed: 'gift_redeemed',
  systemSelected: 'system_selected',
  ctaTapped: 'cta_tapped',
} as const;

export type AnalyticsEventName =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

export function trackAnalyticsEvent(
  analytics: AnalyticsState,
  name: AnalyticsEventName | string,
  metadata?: Record<string, string | number | boolean | null>
): AnalyticsState {
  const now = new Date().toISOString();
  const isAppOpen = name === ANALYTICS_EVENTS.appOpen;

  return {
    ...analytics,
    lastOpenAt: isAppOpen ? now : analytics.lastOpenAt,
    events: [
      {
        id: `${name}-${Date.now()}`,
        name,
        createdAt: now,
        metadata,
      },
      ...analytics.events,
    ].slice(0, 500),
  };
}

export function markFirstCompletion(analytics: AnalyticsState) {
  if (analytics.firstCompletionAt) return analytics;
  return {
    ...analytics,
    firstCompletionAt: new Date().toISOString(),
  };
}

export function buildAnalyticsSummary(analytics: AnalyticsState) {
  const events = analytics.events;
  const activeDays = getDistinctDays(events, ANALYTICS_EVENTS.appOpen);
  const retentionDays = getReturnDaysAfterFirstOpen(analytics);

  return {
    sessions: countEvents(events, ANALYTICS_EVENTS.appOpen),
    onboardingCompleted: countEvents(events, ANALYTICS_EVENTS.onboardingComplete),
    activationMovesShown: countEvents(events, ANALYTICS_EVENTS.activationMoveShown),
    firstMovesStarted: countEvents(events, ANALYTICS_EVENTS.firstMoveStarted),
    completedMoves: countEvents(events, ANALYTICS_EVENTS.moveCompleted),
    completedFocusRuns: countEvents(events, ANALYTICS_EVENTS.focusRunCompleted),
    abandonedFocusRuns: countEvents(events, ANALYTICS_EVENTS.focusRunAbandoned),
    paywallViews:
      countEvents(events, ANALYTICS_EVENTS.softPaywallViewed) +
      countEvents(events, ANALYTICS_EVENTS.hardPaywallViewed),
    softPaywallViews: countEvents(events, ANALYTICS_EVENTS.softPaywallViewed),
    hardPaywallViews: countEvents(events, ANALYTICS_EVENTS.hardPaywallViewed),
    purchaseAttempts: countEvents(events, ANALYTICS_EVENTS.purchaseStarted),
    purchaseSuccess: countEvents(events, ANALYTICS_EVENTS.purchaseCompleted),
    guidanceOpens: countEvents(events, ANALYTICS_EVENTS.guidanceOpened),
    moveLimitHits: countEvents(events, ANALYTICS_EVENTS.moveLimitHit),
    swapLimitHits: countEvents(events, ANALYTICS_EVENTS.swapLimitHit),
    recoveryTriggered: countEvents(events, ANALYTICS_EVENTS.recoveryTriggered),
    recoveryCompleted: countEvents(events, ANALYTICS_EVENTS.recoveryCompleted),
    recoveryPromptsSeen: countEvents(events, ANALYTICS_EVENTS.recoveryPromptSeen),
    recoveryAccepted: countEvents(events, ANALYTICS_EVENTS.recoveryAccepted),
    streakSaverUsed: countEvents(events, ANALYTICS_EVENTS.streakSaverUsed),
    shares: countEvents(events, ANALYTICS_EVENTS.shareOpened),
    shareVariantOpened: countEvents(events, ANALYTICS_EVENTS.shareVariantOpened),
    shareVariantUsed: countEvents(events, ANALYTICS_EVENTS.shareVariantUsed),
    gifts: countEvents(events, ANALYTICS_EVENTS.giftMoveSent),
    activeDays,
    retentionDays,
    notificationScheduled: countEvents(events, ANALYTICS_EVENTS.notificationScheduled),
    rewardViews: countEvents(events, ANALYTICS_EVENTS.rewardViewed),
    ctaTaps: countEvents(events, ANALYTICS_EVENTS.ctaTapped),
  };
}

function countEvents(events: AnalyticsState['events'], name: string) {
  return events.filter((event) => event.name === name).length;
}

function getDistinctDays(events: AnalyticsState['events'], name: string) {
  return new Set(
    events
      .filter((event) => event.name === name)
      .map((event) => event.createdAt.slice(0, 10))
  ).size;
}

function getReturnDaysAfterFirstOpen(analytics: AnalyticsState) {
  const firstOpenDay = analytics.firstOpenAt.slice(0, 10);
  const openDays = new Set(
    analytics.events
      .filter((event) => event.name === ANALYTICS_EVENTS.appOpen)
      .map((event) => event.createdAt.slice(0, 10))
      .filter((day) => day !== firstOpenDay)
  );

  return openDays.size;
}
