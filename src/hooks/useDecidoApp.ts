import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Linking, Platform, Share } from 'react-native';

import { SUGGESTIONS } from '../data/suggestions';
import {
  ANALYTICS_EVENTS,
  buildAnalyticsSummary,
  markFirstCompletion,
  trackAnalyticsEvent,
} from '../lib/analytics';
import { localizeSuggestion } from '../lib/content';
import {
  applyContextAwareSuggestions,
  buildRecoveryMove,
} from '../lib/contextEngine';
import { getTodayKey, pickSuggestions } from '../lib/decisionEngine';
import {
  buildDirectionContext,
  buildDirectionModel,
  getDirectionCategories,
  getDirectionDefinition,
  inferDirectionFromSystem,
  mapDirectionToSystem,
  prioritizeSuggestionsForDirection,
} from '../lib/directionEngine';
import { updateDecisionDnaScores } from '../lib/dnaScoring';
import {
  getDateKeyOffset,
  getUserAccessState,
  toLocalDateKey,
} from '../lib/entitlements';
import { buildFutureProjection } from '../lib/futureProjection';
import { buildGuidance } from '../lib/guidance';
import { buildBehaviorProfile } from '../lib/behaviorProfile';
import {
  buildRecallNotification,
  buildRecoveryNotification,
  buildStreakSaverNotification,
  ensureNotificationPermission,
  scheduleLocalNotification,
} from '../lib/notificationEngine';
import { assignPersonaFromAudit, buildPersonaProfile } from '../lib/persona';
import { buildProgressSummary } from '../lib/progressInsights';
import { buildGiftMovePayload, canSendGift, parseGiftMoveLink } from '../lib/referralEngine';
import { buildRewardProfile, buildRewardResult } from '../lib/rewardSystem';
import { createDefaultAppData, loadAppData, saveAppData } from '../lib/storage';
import { getUiCopy } from '../lib/uiCopy';
import {
  AppData,
  AppTabKey,
  CompletionState,
  DecisionContext,
  DecisionRecord,
  Energy,
  Friction,
  Goal,
  GrowthDirectionId,
  PaywallMode,
  PlanTier,
  Suggestion,
  SystemId,
} from '../types';
import { useStoreBilling } from './useStoreBilling';
import {
  buildSharePersonaLabel,
  buildSimpleDnaCards,
  buildSimpleWeeklySummary,
  buildTonightLine,
  createEmptyFocusRun,
  FocusRunState,
  PaywallState,
  RecoveryPrompt,
} from './useDecidoApp.helpers';

const DEFAULT_CONTEXT: DecisionContext = {
  goal: 'finish',
  friction: 'unclear',
  mode: 'quick-win',
  energy: 'mid',
  minutes: 10,
  budget: 'free',
  category: 'focus',
};

export function useDecidoApp() {
  const billing = useStoreBilling();
  const previousLivePlan = useRef<PlanTier>('free');
  const rewardEventRef = useRef<string | null>(null);
  const recoveryPromptRef = useRef<string | null>(null);
  const shownMoveRef = useRef<string | null>(null);

  const [appData, setAppData] = useState<AppData>(createDefaultAppData());
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<AppTabKey>('today');
  const [context, setContext] = useState<DecisionContext>(DEFAULT_CONTEXT);
  const [selectedMoveId, setSelectedMoveId] = useState<string | null>(null);
  const [forcedMove, setForcedMove] = useState<Suggestion | null>(null);
  const [guidanceVisible, setGuidanceVisible] = useState(false);
  const [paywallState, setPaywallState] = useState<PaywallState>({
    visible: false,
    mode: 'soft-success',
    source: null,
  });
  const [shareRecord, setShareRecord] = useState<DecisionRecord | null>(null);
  const [shareVariant, setShareVariant] = useState<'completion' | 'recovery' | 'streak' | 'preview'>('preview');
  const [focusRun, setFocusRun] = useState<FocusRunState>(createEmptyFocusRun());
  const [reward, setReward] = useState<{
    xpGain: number;
    levelBefore: string;
    levelAfter: string;
    message: string;
  } | null>(null);
  const [pendingSoftPaywall, setPendingSoftPaywall] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [onboardingDirection, setOnboardingDirection] = useState<GrowthDirectionId | null>(null);
  const [onboardingFriction, setOnboardingFriction] = useState<Friction | null>(null);
  const [onboardingMinutes, setOnboardingMinutes] = useState<number | null>(null);
  const [onboardingEnergy, setOnboardingEnergy] = useState<Energy | null>(null);
  const [consecutiveSwaps, setConsecutiveSwaps] = useState(0);

  useEffect(() => {
    loadAppData().then((data) => {
      setAppData(data);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!loaded) return;
    void saveAppData(appData);
  }, [appData, loaded]);

  useEffect(() => {
    if (!loaded) return;

    setAppData((current) => ({
      ...current,
      firstActivatedAt: current.firstActivatedAt ?? new Date().toISOString(),
      analytics: trackAnalyticsEvent(current.analytics, ANALYTICS_EVENTS.appOpen, {
        plan: current.subscription.plan,
      }),
    }));
  }, [loaded]);

  useEffect(() => {
    if (!loaded || !billing.hasLiveStore) return;

    if (previousLivePlan.current === 'free' && billing.currentPlan !== 'free') {
      setAppData((current) => ({
        ...current,
        analytics: trackAnalyticsEvent(current.analytics, ANALYTICS_EVENTS.purchaseCompleted, {
          plan: billing.currentPlan,
          source: 'app-store',
        }),
      }));
    }
    previousLivePlan.current = billing.currentPlan;

    if (appData.subscription.plan === billing.currentPlan) return;

    if (billing.currentPlan !== 'free') {
      setPaywallState((current) => ({ ...current, visible: false }));
      setPendingSoftPaywall(false);
    }

    setAppData((current) => ({
      ...current,
      devPlanPreview: billing.currentPlan,
      subscription: {
        plan: billing.currentPlan,
        productId:
          billing.currentPlan === 'free'
            ? null
            : billing.currentPlan === 'pro-yearly'
              ? 'decido.pro.yearly'
              : billing.currentPlan === 'founding'
                ? 'decido.pro.founding'
                : 'decido.pro.monthly',
        status: billing.currentPlan === 'free' ? 'inactive' : 'active',
        source: billing.currentPlan === 'free' ? 'none' : 'app-store',
        lastSyncedAt: new Date().toISOString(),
      },
      streakFreeze: {
        ...current.streakFreeze,
        credits:
          billing.currentPlan === 'founding'
            ? Math.max(current.streakFreeze.credits, 3)
            : billing.currentPlan === 'free'
              ? current.streakFreeze.credits
              : Math.max(current.streakFreeze.credits, 1),
      },
    }));
  }, [appData.subscription.plan, billing.currentPlan, billing.hasLiveStore, loaded]);

  useEffect(() => {
    if (!focusRun.visible || focusRun.phase !== 'active') return;
    const timer = setInterval(() => {
      setFocusRun((current) => {
        if (current.phase !== 'active') return current;
        const next = Math.max(0, current.secondsLeft - 1);
        if (next === 0) {
          return { ...current, secondsLeft: 0, phase: 'score' };
        }
        return { ...current, secondsLeft: next };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [focusRun.phase, focusRun.visible]);

  useEffect(() => {
    if (!loaded) return;

    const redeemGiftLink = (url: string | null) => {
      if (!url) return;
      const parsed = parseGiftMoveLink(url);
      if (!parsed) return;
      if (appData.gifting.lastReceivedCode === parsed.code) return;

      const giftedMove = SUGGESTIONS.find((suggestion) => suggestion.id === parsed.moveId);
      if (!giftedMove) return;

      setForcedMove(localizeSuggestion(giftedMove, appData.language));
      setGuidanceVisible(true);
      setTab('today');
      setAppData((current) => ({
        ...current,
        gifting: {
          ...current.gifting,
          lastReceivedCode: parsed.code,
        },
        analytics: trackAnalyticsEvent(current.analytics, ANALYTICS_EVENTS.giftRedeemed, {
          code: parsed.code,
          moveId: parsed.moveId,
          sender: parsed.sender,
        }),
      }));
    };

    void Linking.getInitialURL().then(redeemGiftLink);
    const subscription = Linking.addEventListener('url', ({ url }) => redeemGiftLink(url));
    return () => subscription.remove();
  }, [appData.gifting.lastReceivedCode, appData.language, loaded]);

  const copy = useMemo(() => getUiCopy(appData.language), [appData.language]);
  const todayKey = toLocalDateKey();
  const accessState = useMemo(() => getUserAccessState(appData), [appData]);
  const entitlements = accessState.entitlements;
  const completedMoves = useMemo(
    () => appData.decisions.filter((decision) => decision.completion === 'done').length,
    [appData.decisions]
  );

  const currentDirection = appData.currentDirection ?? inferDirectionFromSystem(appData.currentSystem);
  const directionModel = useMemo(
    () => buildDirectionModel(currentDirection, appData.decisions, appData.language),
    [appData.decisions, appData.language, currentDirection]
  );
  const directionOptions = directionModel.options;
  const activeDirection = directionModel.active;

  useEffect(() => {
    setContext((current) => ({
      ...current,
      ...directionModel.context,
      budget: current.budget,
      friction: current.friction,
      minutes: current.minutes,
      energy: current.energy,
    }));
  }, [directionModel.context.category, directionModel.context.goal, directionModel.context.mode]);

  useEffect(() => {
    const mappedSystem = mapDirectionToSystem(currentDirection);
    if (appData.currentSystem === mappedSystem) return;
    setAppData((current) => ({
      ...current,
      currentSystem: mappedSystem,
    }));
  }, [appData.currentSystem, currentDirection]);

  const contextAwareResult = useMemo(() => {
    const localized = pickSuggestions(context, appData.decisions).map((suggestion) =>
      localizeSuggestion(suggestion, appData.language)
    );
    const prioritized = prioritizeSuggestionsForDirection(localized, currentDirection, appData.decisions);
    return applyContextAwareSuggestions(prioritized, context, appData.language);
  }, [appData.decisions, appData.language, context, currentDirection]);

  const suggestions = contextAwareResult.suggestions;
  const selectedMove =
    suggestions.find((suggestion) => suggestion.id === selectedMoveId) ?? suggestions[0] ?? null;
  const activeMove = forcedMove ?? selectedMove;
  const alternatives = suggestions.filter((suggestion) => suggestion.id !== activeMove?.id);
  const onboardingDirectionId = onboardingDirection ?? currentDirection;
  const onboardingPreviewContext = useMemo<DecisionContext>(() => {
    const base = buildDirectionContext(onboardingDirectionId);
    return {
      ...base,
      friction: onboardingFriction ?? base.friction,
      minutes: onboardingMinutes ?? base.minutes,
      energy: onboardingEnergy ?? base.energy,
    };
  }, [onboardingDirectionId, onboardingFriction, onboardingMinutes, onboardingEnergy]);
  const onboardingPreviewMove = useMemo(() => {
    const preview = pickSuggestions(onboardingPreviewContext, appData.decisions)[0];
    return preview ? localizeSuggestion(preview, appData.language) : null;
  }, [appData.decisions, appData.language, onboardingPreviewContext]);

  useEffect(() => {
    if (!selectedMove && suggestions[0] && !forcedMove) {
      setSelectedMoveId(suggestions[0].id);
      return;
    }

    if (!forcedMove && selectedMove && !suggestions.some((suggestion) => suggestion.id === selectedMove.id)) {
      setSelectedMoveId(suggestions[0]?.id ?? null);
    }
  }, [forcedMove, selectedMove, suggestions]);

  useEffect(() => {
    if (!loaded || !guidanceVisible || !activeMove) return;
    setAppData((current) => ({
      ...current,
      analytics: trackAnalyticsEvent(current.analytics, ANALYTICS_EVENTS.guidanceOpened, {
        moveId: activeMove.id,
        system: current.currentSystem,
      }),
    }));
  }, [activeMove, guidanceVisible, loaded]);

  const fullGuidance = useMemo(() => {
    if (!activeMove) return null;
    return buildGuidance(
      activeMove,
      context,
      appData.language,
      appData.decisions,
      appData.persona
    );
  }, [activeMove, context, appData.decisions, appData.language, appData.persona]);

  const guidance = useMemo(() => {
    if (!fullGuidance) return null;
    if (entitlements.guidanceTier === 'full') return fullGuidance;
    return {
      ...fullGuidance,
      steps: fullGuidance.steps.slice(0, 2),
      tinyLesson: '',
      expectedOutcome: '',
      continueTomorrow: '',
    };
  }, [entitlements.guidanceTier, fullGuidance]);

  const projection = useMemo(() => {
    if (!activeMove) return null;
    return buildFutureProjection(context, activeMove, appData.decisions, appData.language);
  }, [activeMove, appData.decisions, appData.language, context]);

  const rewardProfile = useMemo(
    () => buildRewardProfile(appData.decisions, appData.language),
    [appData.decisions, appData.language]
  );
  const progressSummary = useMemo(
    () => buildProgressSummary(appData.decisions, appData.recovery, appData.language),
    [appData.decisions, appData.language, appData.recovery]
  );
  const personaProfile = useMemo(
    () =>
      appData.persona
        ? buildPersonaProfile(appData.persona, appData.language, context.goal)
        : null,
    [appData.language, appData.persona, context.goal]
  );
  const completedDoneDateKeys = useMemo(
    () =>
      Array.from(
        new Set(
          appData.decisions
            .filter((decision) => decision.completion === 'done')
            .map((decision) => decision.dateKey)
        )
      ),
    [appData.decisions]
  );
  const protectedDateKeys = useMemo(
    () => Array.from(new Set([...completedDoneDateKeys, ...appData.streakFreeze.savedDateKeys])),
    [appData.decisions, appData.streakFreeze.savedDateKeys]
  );
  const streak = useMemo(() => {
    let count = 0;
    const protectedSet = new Set(protectedDateKeys);
    const cursor = new Date();

    while (true) {
      const key = toLocalDateKey(cursor);
      if (!protectedSet.has(key)) break;
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    return count;
  }, [protectedDateKeys]);

  const completedToday = completedDoneDateKeys.includes(todayKey);
  const streakSaverEligible = entitlements.streakProtection && streak > 0 && !completedToday;
  const behaviorProfile = useMemo(
    () => buildBehaviorProfile(appData.decisions, appData.recovery, streak, appData.language),
    [appData.decisions, appData.language, appData.recovery, streak]
  );
  const analyticsSummary = useMemo(
    () => buildAnalyticsSummary(appData.analytics),
    [appData.analytics]
  );
  const pending = useMemo(
    () => appData.decisions.filter((decision) => !decision.reviewedAt).slice(0, 3),
    [appData.decisions]
  );
  const recent = useMemo(
    () => appData.decisions.filter((decision) => decision.reviewedAt).slice(0, 5),
    [appData.decisions]
  );
  const dnaCards = useMemo(
    () =>
      buildSimpleDnaCards(
        appData.decisions,
        appData.dnaScores,
        appData.language,
        entitlements.premiumInsights
      ),
    [appData.decisions, appData.dnaScores, appData.language, entitlements.premiumInsights]
  );
  const weeklySummary = useMemo(
    () => buildSimpleWeeklySummary(appData.decisions, appData.language),
    [appData.decisions, appData.language]
  );
  const shareGiftPreview = useMemo(() => {
    const shareMove = shareRecord?.selectedSuggestion ?? activeMove;
    if (!shareMove || !entitlements.isPremium || !canSendGift(appData.gifting.sentCodes)) {
      return null;
    }
    return buildGiftMovePayload(shareMove, appData.language);
  }, [activeMove, appData.gifting.sentCodes, appData.language, entitlements.isPremium, shareRecord]);

  const focusRunView = useMemo(() => {
    if (!focusRun.visible) return focusRun;
    if (focusRun.phase === 'active') {
      const ratio = focusRun.secondsLeft / Math.max(1, focusRun.totalSeconds);
      if (ratio <= 0.2) {
        return { ...focusRun, phase: 'nearFinish' as const };
      }
      if (ratio <= 0.5) {
        return { ...focusRun, phase: 'halfway' as const };
      }
    }
    return focusRun;
  }, [focusRun]);

  const todayGain = guidance?.whatYouGain ?? activeMove?.reason ?? '';
  const tomorrowGain = guidance?.continueTomorrow || projection?.teaser || '';
  const tonightLine = buildTonightLine(appData.language, pending.length, progressSummary.completionRate);
  const softPaywallBody = copy.paywall.momentumAngle;
  const hardPaywallBody = copy.paywall.accessAngle;

  useEffect(() => {
    if (!loaded || !activeMove) return;

    const moveKey = `${todayKey}:${activeMove.id}:${context.goal}:${context.friction}:${appData.currentSystem}`;
    if (shownMoveRef.current === moveKey) return;
    shownMoveRef.current = moveKey;

    setAppData((current) => ({
      ...current,
      analytics: trackAnalyticsEvent(
        current.analytics,
        current.decisions.length === 0
          ? ANALYTICS_EVENTS.firstMoveShown
          : entitlements.isActivationPhase
            ? ANALYTICS_EVENTS.activationMoveShown
            : ANALYTICS_EVENTS.moveShown,
        {
          moveId: activeMove.id,
          system: current.currentSystem,
          phase: entitlements.phase,
        }
      ),
    }));
  }, [
    activeMove,
    appData.currentSystem,
    context.friction,
    context.goal,
    entitlements.isActivationPhase,
    entitlements.phase,
    loaded,
    todayKey,
  ]);

  const recoveryPrompt = useMemo<RecoveryPrompt | null>(() => {
    const latest = appData.decisions[0];

    if (latest?.dateKey === todayKey && latest.focusRunOutcome === 'abandoned' && !completedToday) {
      return {
        title: copy.helpers.recoveryTitle('cracked'),
        body:
          appData.language === 'tr'
            ? '2 dakikalik bir reset ile bugunu tamamen kaybetmeden geri don.'
            : 'Recover with a 2-minute reset before today fully slips.',
        cta: copy.helpers.recoveryCta('reset'),
        source: 'abandon',
        premiumProtected: entitlements.premiumRecovery,
      };
    }

    if (consecutiveSwaps >= 2) {
      return {
        title: copy.helpers.recoveryTitle('fatigue'),
        body:
          appData.language === 'tr'
            ? 'Bir hamle daha degistirmek yerine kisa reset yap. Secim kalitesi toparlanir.'
            : 'Reset before swapping again. Your move quality will come back cleaner.',
        cta: copy.helpers.recoveryCta('reset'),
        source: 'swap-fatigue',
        premiumProtected: entitlements.premiumRecovery,
      };
    }

    if (!completedToday && streak > 0) {
      return {
        title: copy.helpers.recoveryTitle('salvage'),
        body:
          appData.language === 'tr'
            ? 'Kisa bir reset hamlesi bugunu kapatmana ve ritmi korumana yardim eder.'
            : 'A short reset move can still protect the day and keep rhythm alive.',
        cta: copy.helpers.recoveryCta('save'),
        source: 'missed-day',
        premiumProtected: entitlements.streakProtection,
      };
    }

    return null;
  }, [
    copy.helpers,
    appData.decisions,
    appData.language,
    completedToday,
    consecutiveSwaps,
    entitlements.premiumRecovery,
    entitlements.streakProtection,
    streak,
    todayKey,
  ]);

  useEffect(() => {
    if (!loaded || !reward) return;
    const rewardKey = `${reward.levelAfter}:${reward.xpGain}:${appData.decisions[0]?.id ?? 'none'}`;
    if (rewardEventRef.current === rewardKey) return;
    rewardEventRef.current = rewardKey;
    setAppData((current) => ({
      ...current,
      analytics: trackAnalyticsEvent(current.analytics, ANALYTICS_EVENTS.rewardViewed, {
        levelAfter: reward.levelAfter,
        xpGain: reward.xpGain,
      }),
    }));
  }, [appData.decisions, loaded, reward]);

  useEffect(() => {
    if (!loaded || !recoveryPrompt) return;
    const promptKey = `${todayKey}:${recoveryPrompt.source}`;
    if (recoveryPromptRef.current === promptKey) return;
    recoveryPromptRef.current = promptKey;
    setAppData((current) => ({
      ...current,
      analytics: trackAnalyticsEvent(current.analytics, ANALYTICS_EVENTS.recoveryPromptSeen, {
        source: recoveryPrompt.source,
        premiumProtected: recoveryPrompt.premiumProtected,
      }),
    }));
  }, [loaded, recoveryPrompt, todayKey]);

  useEffect(() => {
    if (!loaded || !entitlements.streakProtection || !streakSaverEligible) return;
    if (appData.notifications.permission !== 'granted') return;
    if (appData.notifications.lastStreakSaverDateKey === todayKey) return;

    const payload = buildStreakSaverNotification(appData.language, todayKey);
    void scheduleLocalNotification(payload).then((notificationId) => {
      setAppData((current) => ({
        ...current,
        notifications: {
          ...current.notifications,
          lastStreakSaverDateKey: todayKey,
          lastStreakSaverScheduledAt: payload.date.toISOString(),
          lastStreakSaverNotificationId: notificationId,
        },
        analytics: trackAnalyticsEvent(current.analytics, ANALYTICS_EVENTS.notificationScheduled, {
          type: payload.type,
          dateKey: todayKey,
        }),
      }));
    });
  }, [
    appData.language,
    appData.notifications.lastStreakSaverDateKey,
    appData.notifications.permission,
    entitlements.streakProtection,
    loaded,
    streakSaverEligible,
    todayKey,
  ]);

  useEffect(() => {
    if (!loaded || !recoveryPrompt) return;
    if (appData.notifications.permission !== 'granted') return;
    if (appData.notifications.lastRecoveryDateKey === todayKey) return;

    const payload = buildRecoveryNotification(appData.language, todayKey);
    void scheduleLocalNotification(payload).then((notificationId) => {
      setAppData((current) => ({
        ...current,
        notifications: {
          ...current.notifications,
          lastRecoveryDateKey: todayKey,
          lastRecoveryScheduledAt: payload.date.toISOString(),
          lastRecoveryNotificationId: notificationId,
        },
        analytics: trackAnalyticsEvent(current.analytics, ANALYTICS_EVENTS.notificationScheduled, {
          type: payload.type,
          dateKey: todayKey,
        }),
      }));
    });
  }, [
    appData.language,
    appData.notifications.lastRecoveryDateKey,
    appData.notifications.permission,
    loaded,
    recoveryPrompt,
    todayKey,
  ]);

  useEffect(() => {
    if (!loaded || !entitlements.streakProtection) return;

    const yesterdayKey = getDateKeyOffset(-1);
    const twoDaysAgoKey = getDateKeyOffset(-2);
    const protectedSet = new Set(protectedDateKeys);
    const shouldProtectYesterday =
      !protectedSet.has(yesterdayKey) &&
      protectedSet.has(twoDaysAgoKey) &&
      appData.streakFreeze.credits > 0 &&
      appData.streakFreeze.lastProtectedDateKey !== yesterdayKey;

    if (!shouldProtectYesterday) return;

    setAppData((current) => ({
      ...current,
      streakFreeze: {
        ...current.streakFreeze,
        credits: Math.max(0, current.streakFreeze.credits - 1),
        savedDateKeys: Array.from(new Set([...current.streakFreeze.savedDateKeys, yesterdayKey])),
        lastProtectedDateKey: yesterdayKey,
      },
      analytics: trackAnalyticsEvent(current.analytics, ANALYTICS_EVENTS.streakSaverUsed, {
        dateKey: yesterdayKey,
      }),
    }));
  }, [
    appData.streakFreeze.credits,
    appData.streakFreeze.lastProtectedDateKey,
    entitlements.streakProtection,
    loaded,
    protectedDateKeys,
  ]);

  async function requestNotificationsIfNeeded(reason: 'completion' | 'recovery') {
    if (appData.notifications.permission === 'granted') return 'granted' as const;
    if (appData.notifications.permission === 'denied') return 'denied' as const;

    setAppData((current) => ({
      ...current,
      notifications: {
        ...current.notifications,
        lastPermissionRequestedAt: new Date().toISOString(),
      },
      analytics: trackAnalyticsEvent(
        current.analytics,
        ANALYTICS_EVENTS.notificationPermissionRequested,
        { reason }
      ),
    }));

    const result = await ensureNotificationPermission();

    setAppData((current) => ({
      ...current,
      notifications: {
        ...current.notifications,
        permission: result.permission,
        lastPermissionResolvedAt: new Date().toISOString(),
      },
      analytics: trackAnalyticsEvent(
        current.analytics,
        result.permission === 'granted'
          ? ANALYTICS_EVENTS.notificationPermissionGranted
          : ANALYTICS_EVENTS.notificationPermissionDenied,
        { reason }
      ),
    }));

    return result.permission;
  }

  function showPaywall(mode: PaywallMode, source: string) {
    setPaywallState({
      visible: true,
      mode,
      source,
    });
    setAppData((current) => ({
      ...current,
      usage: {
        ...current.usage,
        paywallSeen: true,
        softPaywallSeenAt:
          mode === 'soft-success' ? new Date().toISOString() : current.usage.softPaywallSeenAt,
        hardPaywallSeenAt:
          mode === 'hard-access' ? new Date().toISOString() : current.usage.hardPaywallSeenAt,
      },
      analytics: trackAnalyticsEvent(
        trackAnalyticsEvent(
          current.analytics,
          mode === 'soft-success'
            ? ANALYTICS_EVENTS.softPaywallViewed
            : ANALYTICS_EVENTS.hardPaywallViewed,
          {
            source,
            plan: current.subscription.plan,
            variant: mode === 'soft-success' ? 'momentum' : 'access',
          }
        ),
        ANALYTICS_EVENTS.premiumGateSeen,
        {
          source,
          plan: current.subscription.plan,
          mode,
        }
      ),
    }));
  }

  function closePaywall() {
    setPaywallState((current) => ({ ...current, visible: false }));
  }

  function completeOnboarding(startAfter = false, openWhy = false) {
    const selectedDirection = onboardingDirection ?? currentDirection;
    const directionContext = buildDirectionContext(selectedDirection);
    const nextContext: DecisionContext = {
      ...directionContext,
      friction: onboardingFriction ?? directionContext.friction,
      minutes: onboardingMinutes ?? directionContext.minutes,
      energy: onboardingEnergy ?? directionContext.energy,
      budget: context.budget,
    };
    const persona = assignPersonaFromAudit(
      nextContext.goal,
      nextContext.friction,
      nextContext.energy,
      nextContext.minutes,
      appData.language
    );
    const now = new Date().toISOString();

    setContext(nextContext);
    setAppData((current) => ({
      ...current,
      onboardingDone: true,
      onboardingCompletedAt: current.onboardingCompletedAt ?? now,
      firstActivatedAt: current.firstActivatedAt ?? now,
      currentDirection: selectedDirection,
      currentDirectionChosenAt: current.currentDirectionChosenAt ?? now,
      currentSystem: mapDirectionToSystem(selectedDirection),
      persona: persona.id,
      analytics: trackAnalyticsEvent(current.analytics, ANALYTICS_EVENTS.onboardingComplete, {
        direction: selectedDirection,
        goal: nextContext.goal,
        friction: nextContext.friction,
        minutes: nextContext.minutes,
        energy: nextContext.energy,
      }),
    }));

    if (openWhy) {
      setGuidanceVisible(true);
    }
    if (startAfter) {
      queueMicrotask(() => startFocusRun(false));
    }
  }

  function startFocusRun(usedGuidance = false) {
    const move = forcedMove ?? selectedMove;
    if (!move) return;

    if (accessState.hasHitMoveLimit) {
      setAppData((current) => ({
        ...current,
        analytics: trackAnalyticsEvent(current.analytics, ANALYTICS_EVENTS.moveLimitHit, {
          phase: entitlements.phase,
        }),
      }));
      showPaywall(completedMoves >= 1 ? 'hard-access' : 'soft-success', 'move-limit');
      return;
    }

    const guide = buildGuidance(
      move,
      context,
      appData.language,
      appData.decisions,
      appData.persona
    );
    const seconds = move.minutes * 60;

    setFocusRun({
      visible: true,
      move,
      steps: guide.steps,
      totalSeconds: seconds,
      secondsLeft: seconds,
      currentStep: 0,
      phase: 'prestart',
      easyMode: false,
      usedGuidance,
      committedAt: null,
      isRecovery: move.id === 'reset-micro-meditation',
    });
    setForcedMove(null);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  function beginFocusRun() {
    if (!focusRun.move) return;

    const nowIso = new Date().toISOString();
    setAppData((current) => ({
      ...current,
      usage: {
        ...current.usage,
        dateKey: todayKey,
        movesUsed: accessState.movesUsedToday + 1,
        focusRunsStarted: accessState.focusRunsStartedToday + 1,
      },
      analytics: trackAnalyticsEvent(
        trackAnalyticsEvent(
          current.analytics,
          ANALYTICS_EVENTS.focusRunStarted,
          {
            moveId: focusRun.move?.id ?? null,
            system: current.currentSystem,
            recovery: focusRun.isRecovery,
          }
        ),
        completedMoves === 0 ? ANALYTICS_EVENTS.firstMoveStarted : ANALYTICS_EVENTS.moveStarted,
        {
          moveId: focusRun.move?.id ?? null,
          system: current.currentSystem,
        }
      ),
    }));
    setFocusRun((current) => ({ ...current, phase: 'active', committedAt: nowIso }));
  }

  function makeFocusRunEasier() {
    setFocusRun((current) => ({
      ...current,
      easyMode: true,
      totalSeconds: Math.min(current.totalSeconds, 120),
      secondsLeft: Math.min(current.secondsLeft, 120),
      steps: current.steps.slice(0, Math.max(1, Math.min(2, current.steps.length))),
      currentStep: 0,
      phase: current.phase === 'leaveConfirm' ? 'active' : current.phase,
    }));
  }

  function nextFocusStep() {
    setFocusRun((current) => {
      if (!current.move) return current;
      if (current.currentStep >= current.steps.length - 1) {
        return { ...current, phase: 'score' };
      }
      return { ...current, currentStep: current.currentStep + 1, phase: 'active' };
    });
  }

  function askLeaveFocusRun() {
    setFocusRun((current) => ({ ...current, phase: 'leaveConfirm' }));
  }

  function resumeFocusRun() {
    setFocusRun((current) => ({ ...current, phase: 'active' }));
  }

  async function scoreFocusRun(score: 1 | 2 | 3 | 4 | 5) {
    if (!focusRun.move) return;
    const actualSeconds = focusRun.totalSeconds - focusRun.secondsLeft;
    const record: DecisionRecord = {
      id: `${Date.now()}`,
      createdAt: new Date().toISOString(),
      dateKey: todayKey,
      context,
      options: suggestions,
      selectedSuggestion: focusRun.move,
      completion: 'done',
      resultScore: score,
      reflection: '',
      reviewedAt: new Date().toISOString(),
      executionSeconds: actualSeconds,
      usedGuidance: focusRun.usedGuidance,
      isRecoveryMove: focusRun.isRecovery,
      swapCountBeforeSelection: consecutiveSwaps,
      focusRunOutcome: 'completed',
    };

    const rewardResult = buildRewardResult(appData.decisions, 'done', score, appData.language);
    const nextDecisions = [record, ...appData.decisions];
    const doneCount = nextDecisions.filter((decision) => decision.completion === 'done').length;
    const dnaScores = updateDecisionDnaScores(
      appData.dnaScores,
      focusRun.totalSeconds,
      actualSeconds,
      focusRun.usedGuidance
    );

    setAppData((current) => ({
      ...current,
      decisions: nextDecisions,
      dnaScores,
      recovery: focusRun.isRecovery
        ? {
            ...current.recovery,
            completedCount: current.recovery.completedCount + 1,
            lastRecoveryCompletedAt: new Date().toISOString(),
          }
        : current.recovery,
      analytics: trackAnalyticsEvent(
        trackAnalyticsEvent(
          markFirstCompletion(current.analytics),
          ANALYTICS_EVENTS.focusRunCompleted,
          {
            moveId: record.selectedSuggestion.id,
            executionSeconds: actualSeconds,
            recovery: focusRun.isRecovery,
          }
        ),
        doneCount === 1 ? ANALYTICS_EVENTS.firstMoveCompleted : ANALYTICS_EVENTS.moveCompleted,
        {
          moveId: record.selectedSuggestion.id,
          score,
          usedGuidance: focusRun.usedGuidance,
          system: current.currentSystem,
          recovery: focusRun.isRecovery,
        }
      ),
    }));

    setFocusRun(createEmptyFocusRun());
    setReward(rewardResult);
    setShareRecord(record);
    setTab('today');
    setConsecutiveSwaps(0);
    setForcedMove(null);

    if (
      !entitlements.isPremium &&
      !entitlements.isActivationPhase &&
      doneCount >= 2 &&
      !appData.usage.softPaywallSeenAt
    ) {
      setPendingSoftPaywall(true);
    }

    const permission = await requestNotificationsIfNeeded('completion');
    if (permission === 'granted') {
      const recall = buildRecallNotification(
        record.selectedSuggestion.id,
        record.selectedSuggestion.title,
        appData.language
      );
      const notificationId = await scheduleLocalNotification(recall);
      setAppData((current) => ({
        ...current,
        notifications: {
          ...current.notifications,
          lastRecallMoveId: record.selectedSuggestion.id,
          lastRecallAt: recall.date.toISOString(),
          lastRecallNotificationId: notificationId,
        },
        analytics: trackAnalyticsEvent(current.analytics, ANALYTICS_EVENTS.notificationScheduled, {
          type: recall.type,
          moveId: record.selectedSuggestion.id,
        }),
      }));
    }

    if (focusRun.isRecovery) {
      setAppData((current) => ({
        ...current,
        analytics: trackAnalyticsEvent(current.analytics, ANALYTICS_EVENTS.recoveryCompleted, {
          source: current.recovery.lastRecoverySource,
        }),
      }));
    }

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function leaveFocusRunAnyway() {
    if (!focusRun.move) return;

    const actualSeconds = focusRun.totalSeconds - focusRun.secondsLeft;
    const progressRatio = actualSeconds / Math.max(focusRun.totalSeconds, 1);
    const completion: CompletionState =
      progressRatio >= 0.35 || focusRun.currentStep > 0 ? 'partial' : 'skipped';
    const resultScore = completion === 'partial' ? 2 : 1;

    const record: DecisionRecord = {
      id: `${Date.now()}`,
      createdAt: new Date().toISOString(),
      dateKey: todayKey,
      context,
      options: suggestions,
      selectedSuggestion: focusRun.move,
      completion,
      resultScore,
      reflection: '',
      reviewedAt: new Date().toISOString(),
      executionSeconds: actualSeconds,
      usedGuidance: focusRun.usedGuidance,
      isRecoveryMove: focusRun.isRecovery,
      swapCountBeforeSelection: consecutiveSwaps,
      focusRunOutcome: completion === 'partial' ? 'partial' : 'abandoned',
    };

    setAppData((current) => ({
      ...current,
      decisions: [record, ...current.decisions],
      recovery: {
        ...current.recovery,
        lastRecoveryPromptAt: new Date().toISOString(),
        lastRecoverySource: 'abandon',
        triggeredCount: current.recovery.triggeredCount + 1,
        abandonedCount: current.recovery.abandonedCount + 1,
      },
      analytics: trackAnalyticsEvent(
        trackAnalyticsEvent(
          current.analytics,
          completion === 'partial'
            ? ANALYTICS_EVENTS.focusRunPartial
            : ANALYTICS_EVENTS.focusRunAbandoned,
          {
            moveId: record.selectedSuggestion.id,
            executionSeconds: actualSeconds,
          }
        ),
        completion === 'partial' ? ANALYTICS_EVENTS.recoveryTriggered : ANALYTICS_EVENTS.moveSkipped,
        {
          moveId: record.selectedSuggestion.id,
          source: 'abandon',
        }
      ),
    }));

    setFocusRun(createEmptyFocusRun());
    setForcedMove(null);
    setGuidanceVisible(false);
    setTab('today');
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }

  function startRecoveryMove(source: RecoveryPrompt['source']) {
    const resetMove = buildRecoveryMove(appData.language, source);
    setForcedMove(resetMove);
    setGuidanceVisible(true);
    setTab('today');
    setConsecutiveSwaps(0);
    setAppData((current) => ({
      ...current,
      recovery: {
        ...current.recovery,
        lastRecoveryPromptAt: new Date().toISOString(),
        lastRecoverySource: source,
        triggeredCount: current.recovery.triggeredCount + 1,
      },
      usage: {
        ...current.usage,
        dateKey: todayKey,
        recoveriesUsed: current.usage.dateKey === todayKey ? current.usage.recoveriesUsed + 1 : 1,
      },
      analytics: trackAnalyticsEvent(
        trackAnalyticsEvent(current.analytics, ANALYTICS_EVENTS.recoveryTriggered, {
          source,
        }),
        ANALYTICS_EVENTS.recoveryAccepted,
        {
          source,
        }
      ),
    }));
  }

  function swapMove() {
    if (!alternatives.length) return;
    if (accessState.hasHitSwapLimit) {
      setAppData((current) => ({
        ...current,
        analytics: trackAnalyticsEvent(current.analytics, ANALYTICS_EVENTS.swapLimitHit, {
          phase: entitlements.phase,
        }),
      }));
      showPaywall(completedMoves >= 1 ? 'hard-access' : 'soft-success', 'swap-limit');
      return;
    }

    if (consecutiveSwaps >= 2) {
      startRecoveryMove('swap-fatigue');
      return;
    }

    const next = alternatives[0];
    setForcedMove(null);
    setSelectedMoveId(next.id);
    setConsecutiveSwaps((current) => current + 1);
    setAppData((current) => ({
      ...current,
      usage: {
        ...current.usage,
        dateKey: todayKey,
        swapsUsed: accessState.swapsUsedToday + 1,
      },
      analytics: trackAnalyticsEvent(current.analytics, ANALYTICS_EVENTS.swapUsed, {
        nextMoveId: next.id,
        system: current.currentSystem,
      }),
    }));
  }

  function startStreakSaverReset() {
    startRecoveryMove('missed-day');
    setAppData((current) => ({
      ...current,
      analytics: trackAnalyticsEvent(current.analytics, ANALYTICS_EVENTS.streakSaverStarted, {
        credits: current.streakFreeze.credits,
      }),
    }));
  }

  function selectDirection(directionId: GrowthDirectionId) {
    const direction = buildDirectionModel(directionId, appData.decisions, appData.language);
    const now = new Date().toISOString();

    setAppData((current) => ({
      ...current,
      currentDirection: directionId,
      currentDirectionChosenAt: now,
      currentSystem: mapDirectionToSystem(directionId),
      analytics: trackAnalyticsEvent(current.analytics, ANALYTICS_EVENTS.systemSelected, {
        system: mapDirectionToSystem(directionId),
        direction: directionId,
      }),
    }));
    setContext((current) => ({
      ...current,
      ...direction.context,
      budget: current.budget,
    }));
    setForcedMove(null);
    setSelectedMoveId(null);
    setConsecutiveSwaps(0);
    setTab('today');
  }

  function openShare(record: DecisionRecord | null = null) {
    const nextVariant: 'completion' | 'recovery' | 'streak' | 'preview' =
      record?.isRecoveryMove || record?.focusRunOutcome === 'partial'
        ? 'recovery'
        : streak >= 7
          ? 'streak'
          : record?.completion === 'done'
            ? 'completion'
            : 'preview';

    if (record) {
      setShareRecord(record);
      setShareVariant(nextVariant);
      setAppData((current) => ({
        ...current,
        analytics: trackAnalyticsEvent(
          trackAnalyticsEvent(current.analytics, ANALYTICS_EVENTS.shareOpened, {
            recordId: record.id,
          }),
          ANALYTICS_EVENTS.shareVariantOpened,
          {
            variant: nextVariant,
            recordId: record.id,
          }
        ),
      }));
      return;
    }

    const move = forcedMove ?? selectedMove;
    if (!move) return;

    setShareRecord({
      id: 'preview-share',
      createdAt: new Date().toISOString(),
      dateKey: todayKey,
      context,
      options: suggestions,
      selectedSuggestion: move,
      completion: null,
      resultScore: null,
      reflection: '',
      reviewedAt: null,
      executionSeconds: null,
      isRecoveryMove: move.id === 'reset-micro-meditation',
      swapCountBeforeSelection: consecutiveSwaps,
      focusRunOutcome: null,
    });
    setShareVariant(nextVariant);
    setAppData((current) => ({
      ...current,
      analytics: trackAnalyticsEvent(
        trackAnalyticsEvent(current.analytics, ANALYTICS_EVENTS.shareOpened, {
          moveId: move.id,
        }),
        ANALYTICS_EVENTS.shareVariantOpened,
        {
          variant: nextVariant,
          moveId: move.id,
        }
      ),
    }));
  }

  async function performShare() {
    if (!shareRecord) return;
    const shareMessage =
      shareGiftPreview?.shareMessage ??
      `${shareRecord.selectedSuggestion.title}. ${shareRecord.selectedSuggestion.action}`;

    await Share.share({
      message: shareMessage,
    });

    setAppData((current) => ({
      ...current,
      gifting: shareGiftPreview
        ? {
            ...current.gifting,
            sentCodes: [...current.gifting.sentCodes, shareGiftPreview.code],
          }
        : current.gifting,
      analytics: trackAnalyticsEvent(
        trackAnalyticsEvent(
          current.analytics,
          shareGiftPreview ? ANALYTICS_EVENTS.giftMoveSent : ANALYTICS_EVENTS.shareSent,
          shareGiftPreview ? { code: shareGiftPreview.code } : { recordId: shareRecord.id }
        ),
        ANALYTICS_EVENTS.shareVariantUsed,
        {
          variant: shareVariant,
          mode: shareGiftPreview ? 'gift' : 'standard',
        }
      ),
    }));
    setShareRecord(null);
    setShareVariant('preview');
  }

  function trackCtaTap(screen: string, cta: string, contextMeta?: Record<string, string | number | boolean | null>) {
    setAppData((current) => ({
      ...current,
      analytics: trackAnalyticsEvent(current.analytics, ANALYTICS_EVENTS.ctaTapped, {
        screen,
        cta,
        ...contextMeta,
      }),
    }));
  }

  async function purchasePlan(plan: Exclude<PlanTier, 'free'>) {
    if (billing.purchasePending || billing.restorePending) {
      return;
    }

    setAppData((current) => ({
      ...current,
      analytics: trackAnalyticsEvent(current.analytics, ANALYTICS_EVENTS.purchaseStarted, {
        plan,
        liveStore: billing.hasLiveStore,
      }),
    }));

    try {
      await billing.purchasePlan(plan);
    } catch (error) {
      Alert.alert(
        appData.language === 'tr' ? 'Magaza kullanilamiyor' : 'Store unavailable',
        error instanceof Error
          ? error.message
          : appData.language === 'tr'
            ? 'Satin alim baslatilamadi.'
            : 'Purchase could not start.'
      );
    }
  }

  async function restorePurchases() {
    if (billing.purchasePending || billing.restorePending) {
      return;
    }

    try {
      await billing.restore();
    } catch (error) {
      Alert.alert(
        appData.language === 'tr' ? 'Geri yukleme basarisiz' : 'Restore failed',
        error instanceof Error
          ? error.message
          : appData.language === 'tr'
            ? 'Satin alimlar geri yuklenemedi.'
            : 'Could not restore purchases.'
      );
    }
  }

  async function manageSubscription() {
    if (billing.hasLiveStore) {
      try {
        await billing.manage(appData.subscription.productId);
        return;
      } catch (error) {
        Alert.alert(
          appData.language === 'tr' ? 'Abonelik ayarlari' : 'Subscription settings',
          error instanceof Error
            ? error.message
            : appData.language === 'tr'
              ? 'Abonelik ayarlari acilamadi.'
              : 'Could not open subscription settings.'
        );
        return;
      }
    }

    if (Platform.OS !== 'web') {
      Alert.alert(
        appData.language === 'tr' ? 'Abonelik ayarlari' : 'Subscription settings',
        appData.language === 'tr'
          ? 'Native store baglantisi hazir oldugunda abonelik ayarlari acilir.'
          : 'Subscription settings will open once the native store connection is ready.'
      );
      return;
    }

    if (appData.subscription.plan === 'free') {
      showPaywall('soft-success', 'settings-upgrade');
      return;
    }
    Alert.alert(
      appData.language === 'tr' ? 'Abonelik' : 'Subscription',
      appData.language === 'tr' ? 'Bu cihazda Pro aktif.' : 'Pro is active on this device.'
    );
  }

  function toggleLanguage() {
    setAppData((current) => ({
      ...current,
      language: current.language === 'en' ? 'tr' : 'en',
    }));
  }

  function closeReward() {
    setReward(null);
    if (pendingSoftPaywall) {
      setPendingSoftPaywall(false);
      showPaywall('soft-success', 'post-success');
    }
  }

  const phaseLabel = copy.helpers.phaseLabel({
    isPremium: entitlements.isPremium,
    isActivationPhase: entitlements.isActivationPhase,
    activationDay: accessState.activationDay,
  });
  const movesLeftLabel = entitlements.isPremium
    ? copy.helpers.unlimitedMoves
    : copy.helpers.movesLeftLabel(accessState.movesRemaining);
  const swapsLeftLabel = entitlements.isPremium
    ? copy.helpers.unlimitedSwaps
    : copy.helpers.swapsLeftLabel(accessState.swapsRemaining);
  const premiumTease = copy.helpers.premiumTease({
    plan: appData.subscription.plan,
    isActivationPhase: entitlements.isActivationPhase,
  });
  const storeStatusLine = billing.purchasePending
    ? appData.language === 'tr'
      ? 'Satin alim isleniyor...'
      : 'Processing purchase...'
    : billing.restorePending
      ? appData.language === 'tr'
        ? 'Satin alimlar geri yukleniyor...'
        : 'Restoring purchases...'
      : billing.hasLiveStore
        ? billing.catalogLoaded
          ? null
          : appData.language === 'tr'
            ? 'Magaza baglaniyor...'
            : 'Connecting to the store...'
        : Platform.OS !== 'web'
          ? appData.language === 'tr'
            ? 'Magaza henuz hazir degil.'
            : 'Store is not ready yet.'
          : null;

  return {
    loaded,
    copy,
    appData,
    tab,
    setTab,
    context,
    setContext,
    suggestions,
    selectedMove: activeMove,
    guidance,
    fullGuidance,
    guidanceVisible,
    setGuidanceVisible,
    projection,
    rewardProfile,
    streak,
    todayGain,
    tomorrowGain,
    tonightLine,
    focusRunView,
    reward,
    paywallVisible: paywallState.visible,
    paywallMode: paywallState.mode,
    paywallSource: paywallState.source,
    paywallBody: paywallState.mode === 'soft-success' ? softPaywallBody : hardPaywallBody,
    setPaywallVisible: (visible: boolean) => {
      if (!visible) {
        closePaywall();
        return;
      }
      showPaywall('soft-success', 'manual');
    },
    shareRecord,
    shareVariant,
    setShareRecord,
    directionOptions,
    activeDirection,
    weeklyBlueprint: directionModel.weeklyBlueprint,
    dnaCards,
    dnaLockedCount: dnaCards.filter((card) => card.metric === copy.states.locked).length,
    weeklySummary,
    pending,
    recent,
    analyticsSummary,
    progressSummary,
    behaviorProfile,
    movesRemaining: accessState.movesRemaining,
    swapsRemaining: accessState.swapsRemaining,
    isPro: entitlements.isPremium,
    accessState,
    entitlements,
    streakSaverEligible,
    streakFreezeCredits: appData.streakFreeze.credits,
    consecutiveSwaps,
    onboardingStep,
    setOnboardingStep,
    onboardingDirection,
    setOnboardingDirection,
    onboardingFriction,
    setOnboardingFriction,
    onboardingMinutes,
    setOnboardingMinutes,
    onboardingEnergy,
    setOnboardingEnergy,
    startFocusRun,
    beginFocusRun,
    makeFocusRunEasier,
    nextFocusStep,
    askLeaveFocusRun,
    resumeFocusRun,
    leaveFocusRunAnyway,
    scoreFocusRun,
    swapMove,
    startStreakSaverReset,
    startRecoveryMove,
    selectDirection,
    performShare,
    openShare,
    trackCtaTap,
    purchasePlan,
    restorePurchases,
    manageSubscription,
    toggleLanguage,
    closeReward,
    completeOnboarding,
    contextWindowLabel: contextAwareResult.label,
    externalSignals: contextAwareResult.externalSignals,
    personaTitle: personaProfile?.title ?? null,
    personaAuditLine: personaProfile?.auditLine ?? null,
    currentMoveTitle: activeMove?.title ?? copy.today.noMove,
    onboardingPreviewTitle: onboardingPreviewMove?.title ?? null,
    shareGiftPreview,
    sharePersonaLabel: buildSharePersonaLabel(currentDirection, streak, appData.language),
    paywallPriceLabels: billing.priceLabels,
    storeConnected: billing.hasLiveStore,
    storeCatalogLoaded: billing.catalogLoaded,
    storeBusy: billing.purchasePending || billing.restorePending,
    storeError: billing.storeError,
    storeStatusLine,
    phaseLabel,
    movesLeftLabel,
    swapsLeftLabel,
    premiumTease,
    recoveryPrompt,
    openPaywall: showPaywall,
  };
}


