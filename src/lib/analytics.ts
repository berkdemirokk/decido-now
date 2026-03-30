import { AnalyticsState } from '../types';

export function trackAnalyticsEvent(
  analytics: AnalyticsState,
  name: string,
  metadata?: Record<string, string | number | boolean | null>
): AnalyticsState {
  const now = new Date().toISOString();

  return {
    ...analytics,
    lastOpenAt: now,
    events: [
      {
        id: `${name}-${Date.now()}`,
        name,
        createdAt: now,
        metadata,
      },
      ...analytics.events,
    ].slice(0, 250),
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
  const sessions = countEvents(events, 'app_open');
  const completedMoves = countEvents(events, 'move_completed');
  const paywallViews = countEvents(events, 'paywall_view');
  const purchaseAttempts = countEvents(events, 'purchase_attempt');
  const purchaseSuccess = countEvents(events, 'purchase_success');
  const shares = countEvents(events, 'share_open');
  const gifts = countEvents(events, 'gift_move');

  return {
    sessions,
    completedMoves,
    paywallViews,
    purchaseAttempts,
    purchaseSuccess,
    shares,
    gifts,
    retentionDays: getDistinctDays(events, 'app_open'),
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
