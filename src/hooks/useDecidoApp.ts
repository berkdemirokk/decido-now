import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Linking, Platform, Share } from 'react-native';

import { SUGGESTIONS } from '../data/suggestions';
import { localizeSuggestion } from '../lib/content';
import { buildAnalyticsSummary, markFirstCompletion, trackAnalyticsEvent } from '../lib/analytics';
import {
  applyContextAwareSuggestions,
  buildDecisionFatigueReset,
} from '../lib/contextEngine';
import {
  countDailyRequests,
  getTodayKey,
  pickSuggestions,
} from '../lib/decisionEngine';
import { updateDecisionDnaScores } from '../lib/dnaScoring';
import { buildFutureProjection } from '../lib/futureProjection';
import { buildGuidance } from '../lib/guidance';
import {
  buildRecallNotification,
  buildStreakSaverNotification,
  ensureNotificationPermission,
  scheduleLocalNotification,
} from '../lib/notificationEngine';
import { assignPersonaFromAudit, buildPersonaProfile } from '../lib/persona';
import { buildGiftMovePayload, canSendGift, parseGiftMoveLink } from '../lib/referralEngine';
import { getUiCopy } from '../lib/uiCopy';
import { buildRewardProfile, buildRewardResult } from '../lib/rewardSystem';
import { buildTrackCards } from '../lib/trackEngine';
import { createDefaultAppData, loadAppData, saveAppData } from '../lib/storage';
import { useStoreBilling } from './useStoreBilling';
import { AppData, AppTabKey, DecisionContext, DecisionRecord, Energy, Friction, Goal, PlanTier, Suggestion, SystemId } from '../types';

const DEFAULT_CONTEXT: DecisionContext = {
  goal: 'finish',
  friction: 'unclear',
  mode: 'quick-win',
  energy: 'mid',
  minutes: 10,
  budget: 'free',
  category: 'focus',
};

interface FocusRunState {
  visible: boolean;
  move: Suggestion | null;
  steps: string[];
  totalSeconds: number;
  secondsLeft: number;
  currentStep: number;
  phase: 'prestart' | 'active' | 'halfway' | 'nearFinish' | 'score' | 'leaveConfirm';
  easyMode: boolean;
  usedGuidance: boolean;
}

export function useDecidoApp() {
  const billing = useStoreBilling();
  const previousLivePlan = useRef<PlanTier>('free');
  const [appData, setAppData] = useState<AppData>(createDefaultAppData());
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<AppTabKey>('today');
  const [context, setContext] = useState<DecisionContext>(DEFAULT_CONTEXT);
  const [selectedMoveId, setSelectedMoveId] = useState<string | null>(null);
  const [forcedMove, setForcedMove] = useState<Suggestion | null>(null);
  const [guidanceVisible, setGuidanceVisible] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [shareRecord, setShareRecord] = useState<DecisionRecord | null>(null);
  const [focusRun, setFocusRun] = useState<FocusRunState>({
    visible: false,
    move: null,
    steps: [],
    totalSeconds: 0,
    secondsLeft: 0,
    currentStep: 0,
    phase: 'prestart',
    easyMode: false,
    usedGuidance: false,
  });
  const [reward, setReward] = useState<{
    xpGain: number;
    levelBefore: string;
    levelAfter: string;
    message: string;
  } | null>(null);
  const [pendingPaywall, setPendingPaywall] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [onboardingGoal, setOnboardingGoal] = useState<Goal | null>(null);
  const [onboardingFriction, setOnboardingFriction] = useState<Friction | null>(null);
  const [onboardingMinutes, setOnboardingMinutes] = useState<number | null>(null);
  const [onboardingEnergy, setOnboardingEnergy] = useState<Energy | null>(null);
  const [consecutiveSwaps, setConsecutiveSwaps] = useState(0);

  useEffect(() => {
    loadAppData().then((data) => {
      const todayKey = getTodayKey();
      const nextData =
        data.usage.dateKey === todayKey
          ? data
          : {
              ...data,
              usage: {
                dateKey: todayKey,
                swapsUsed: 0,
                paywallSeen: false,
              },
            };
      setAppData(nextData);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveAppData(appData);
  }, [appData, loaded]);

  useEffect(() => {
    if (!loaded) return;
    setAppData((current) => ({
      ...current,
      analytics: trackAnalyticsEvent(current.analytics, 'app_open'),
    }));
  }, [loaded]);

  useEffect(() => {
    if (!loaded || !paywallVisible) return;
    setAppData((current) => ({
      ...current,
      usage: {
        ...current.usage,
        paywallSeen: true,
      },
      analytics: trackAnalyticsEvent(current.analytics, 'paywall_view', {
        plan: current.subscription.plan,
      }),
    }));
  }, [loaded, paywallVisible]);

  useEffect(() => {
    if (!loaded || !billing.hasLiveStore) return;

    if (previousLivePlan.current === 'free' && billing.currentPlan !== 'free') {
      setAppData((current) => ({
        ...current,
        analytics: trackAnalyticsEvent(current.analytics, 'purchase_success', {
          plan: billing.currentPlan,
          source: 'app-store',
        }),
      }));
    }
    previousLivePlan.current = billing.currentPlan;

    if (appData.subscription.plan === billing.currentPlan) return;

    if (billing.currentPlan !== 'free') {
      setPaywallVisible(false);
      setPendingPaywall(false);
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
    if (!loaded || appData.notifications.permission !== 'unknown') return;

    void ensureNotificationPermission().then((permission) => {
      setAppData((current) => ({
        ...current,
        notifications: {
          ...current.notifications,
          permission,
        },
      }));
    });
  }, [appData.notifications.permission, loaded]);

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
        analytics: trackAnalyticsEvent(current.analytics, 'gift_redeemed', {
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
  const todayKey = getTodayKey();
  const trackCards = useMemo(
    () => buildTrackCards(appData.decisions, appData.language),
    [appData.decisions, appData.language]
  );
  const activeTrack = trackCards.find((card) => card.id === appData.currentSystem) ?? trackCards[0];

  useEffect(() => {
    if (!activeTrack) return;
    setContext((current) => ({
      ...activeTrack.context,
      goal: current.goal,
      friction: current.friction,
      minutes: current.minutes,
      energy: current.energy,
    }));
  }, [activeTrack?.id]);

  const contextAwareResult = useMemo(() => {
    const localized = pickSuggestions(context, appData.decisions).map((suggestion) =>
      localizeSuggestion(suggestion, appData.language)
    );
    return applyContextAwareSuggestions(localized, context, appData.language);
  }, [appData.decisions, appData.language, context]);
  const suggestions = contextAwareResult.suggestions;

  const selectedMove =
    suggestions.find((suggestion) => suggestion.id === selectedMoveId) ?? suggestions[0] ?? null;
  const activeMove = forcedMove ?? selectedMove;
  const alternatives = suggestions.filter((suggestion) => suggestion.id !== activeMove?.id);

  useEffect(() => {
    if (!loaded || !guidanceVisible || !activeMove) return;
    setAppData((current) => ({
      ...current,
      analytics: trackAnalyticsEvent(current.analytics, 'guidance_open', {
        moveId: activeMove.id,
        system: current.currentSystem,
      }),
    }));
  }, [activeMove, guidanceVisible, loaded]);

  useEffect(() => {
    if (!selectedMove && suggestions[0] && !forcedMove) {
      setSelectedMoveId(suggestions[0].id);
      return;
    }

    if (!forcedMove && selectedMove && !suggestions.some((suggestion) => suggestion.id === selectedMove.id)) {
      setSelectedMoveId(suggestions[0]?.id ?? null);
    }
  }, [forcedMove, selectedMove, suggestions]);

  const guidance = useMemo(() => {
    if (!activeMove) return null;
    return buildGuidance(
      activeMove,
      context,
      appData.language,
      appData.decisions,
      appData.persona
    );
  }, [activeMove, context, appData.language, appData.decisions, appData.persona]);

  const projection = useMemo(() => {
    if (!activeMove) return null;
    return buildFutureProjection(context, activeMove, appData.decisions, appData.language);
  }, [activeMove, context, appData.decisions, appData.language]);

  const rewardProfile = useMemo(
    () => buildRewardProfile(appData.decisions, appData.language),
    [appData.decisions, appData.language]
  );
  const personaProfile = useMemo(
    () =>
      appData.persona
        ? buildPersonaProfile(appData.persona, appData.language, context.goal)
        : null,
    [appData.persona, appData.language, context.goal]
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
      const key = cursor.toISOString().slice(0, 10);
      if (!protectedSet.has(key)) break;
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }, [protectedDateKeys]);

  const dnaCards = useMemo(
    () => buildSimpleDnaCards(appData.decisions, appData.dnaScores),
    [appData.decisions, appData.dnaScores]
  );
  const weeklySummary = useMemo(() => buildSimpleWeeklySummary(appData.decisions), [appData.decisions]);
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

  const countToday = countDailyRequests(appData.decisions, todayKey);
  const isFree = appData.subscription.plan === 'free';
  const isPro = !isFree;
  const completedToday = completedDoneDateKeys.includes(todayKey);
  const movesRemaining = isFree ? Math.max(1 - countToday, 0) : 999;
  const streakSaverEligible = isPro && streak > 0 && !completedToday;
  const streakSaverMove = useMemo(
    () => buildDecisionFatigueReset(appData.language),
    [appData.language]
  );
  const shareGiftPreview = useMemo(() => {
    const shareMove = shareRecord?.selectedSuggestion ?? activeMove;
    if (!shareMove || !isPro || !canSendGift(appData.gifting.sentCodes)) return null;
    return buildGiftMovePayload(shareMove, appData.language);
  }, [activeMove, appData.gifting.sentCodes, appData.language, isPro, shareRecord]);

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
  const tomorrowGain = guidance?.continueTomorrow ?? projection?.teaser ?? '';
  const tonightLine = pending.length
    ? `${pending.length} move waiting for a score tonight.`
    : 'Score one move tonight to keep tomorrow sharp.';

  useEffect(() => {
    if (!loaded || !isPro) return;

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
    }));
  }, [
    appData.streakFreeze.credits,
    appData.streakFreeze.lastProtectedDateKey,
    isPro,
    loaded,
    protectedDateKeys,
  ]);

  useEffect(() => {
    if (!loaded || !streakSaverEligible) return;
    if (appData.notifications.permission !== 'granted') return;
    if (appData.notifications.lastStreakSaverDateKey === todayKey) return;

    const payload = buildStreakSaverNotification(appData.language);
    void scheduleLocalNotification(payload);
    setAppData((current) => ({
      ...current,
      notifications: {
        ...current.notifications,
        lastStreakSaverDateKey: todayKey,
      },
    }));
  }, [
    appData.language,
    appData.notifications.lastStreakSaverDateKey,
    appData.notifications.permission,
    loaded,
    streakSaverEligible,
    todayKey,
  ]);

  function completeOnboarding(startAfter = false, openWhy = false) {
    const nextContext: DecisionContext = {
      ...context,
      goal: onboardingGoal ?? context.goal,
      friction: onboardingFriction ?? context.friction,
      minutes: onboardingMinutes ?? context.minutes,
      energy: onboardingEnergy ?? context.energy,
    };
    const persona = assignPersonaFromAudit(
      onboardingGoal ?? context.goal,
      onboardingFriction ?? context.friction,
      onboardingEnergy ?? context.energy,
      onboardingMinutes ?? context.minutes,
      appData.language
    );

    setContext(nextContext);
    setAppData((current) => ({
      ...current,
      onboardingDone: true,
      persona: persona.id,
      analytics: trackAnalyticsEvent(current.analytics, 'onboarding_complete', {
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
    if (isFree && countToday >= 1) {
      setPaywallVisible(true);
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
    });
    setAppData((current) => ({
      ...current,
      analytics: trackAnalyticsEvent(current.analytics, 'move_presented', {
        moveId: move.id,
        usedGuidance,
        system: current.currentSystem,
      }),
    }));
    setForcedMove(null);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  function beginFocusRun() {
    setAppData((current) => ({
      ...current,
      analytics: trackAnalyticsEvent(current.analytics, 'focus_run_started', {
        moveId: focusRun.move?.id ?? null,
        system: current.currentSystem,
      }),
    }));
    setFocusRun((current) => ({ ...current, phase: 'active' }));
  }

  function makeFocusRunEasier() {
    setFocusRun((current) => ({
      ...current,
      easyMode: true,
      totalSeconds: 120,
      secondsLeft: Math.min(current.secondsLeft, 120),
      steps: current.steps.slice(0, Math.min(2, current.steps.length)),
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

  function scoreFocusRun(score: 1 | 2 | 3 | 4 | 5) {
    if (!focusRun.move) return;
    const completedMove = focusRun.move;
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
      analytics: trackAnalyticsEvent(
        markFirstCompletion(current.analytics),
        'move_completed',
        {
          moveId: record.selectedSuggestion.id,
          score,
          executionSeconds: actualSeconds,
          usedGuidance: focusRun.usedGuidance,
          system: current.currentSystem,
        }
      ),
    }));
    setFocusRun({
      visible: false,
      move: null,
      steps: [],
      totalSeconds: 0,
      secondsLeft: 0,
      currentStep: 0,
      phase: 'prestart',
      easyMode: false,
      usedGuidance: false,
    });
    setReward(rewardResult);
    setShareRecord(record);
    setTab('progress');
    setConsecutiveSwaps(0);
    setForcedMove(null);
    if (isFree && doneCount >= 2) {
      setPendingPaywall(true);
    }
    if (appData.notifications.permission === 'granted') {
      const recall = buildRecallNotification(completedMove.title, appData.language);
      void scheduleLocalNotification(recall);
      setAppData((current) => ({
        ...current,
        notifications: {
          ...current.notifications,
          lastRecallMoveId: completedMove.id,
          lastRecallAt: recall.date.toISOString(),
        },
      }));
    }
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function leaveFocusRunAnyway() {
    if (!focusRun.move) return;

    const record: DecisionRecord = {
      id: `${Date.now()}`,
      createdAt: new Date().toISOString(),
      dateKey: todayKey,
      context,
      options: suggestions,
      selectedSuggestion: focusRun.move,
      completion: 'skipped',
      resultScore: 1,
      reflection: '',
      reviewedAt: new Date().toISOString(),
      executionSeconds: focusRun.totalSeconds - focusRun.secondsLeft,
      usedGuidance: focusRun.usedGuidance,
    };

    setAppData((current) => ({
      ...current,
      decisions: [record, ...current.decisions],
      analytics: trackAnalyticsEvent(current.analytics, 'move_skipped', {
        moveId: record.selectedSuggestion.id,
        system: current.currentSystem,
      }),
    }));
    setFocusRun({
      visible: false,
      move: null,
      steps: [],
      totalSeconds: 0,
      secondsLeft: 0,
      currentStep: 0,
      phase: 'prestart',
      easyMode: false,
      usedGuidance: false,
    });
    setForcedMove(null);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }

  function swapMove() {
    if (!alternatives.length) return;
    if (isFree && appData.usage.dateKey === todayKey && appData.usage.swapsUsed >= 3) {
      setPaywallVisible(true);
      return;
    }

    if (consecutiveSwaps >= 2) {
      const resetMove = buildDecisionFatigueReset(appData.language);
      setForcedMove(resetMove);
      setGuidanceVisible(true);
      setConsecutiveSwaps(0);
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
        swapsUsed: current.usage.dateKey === todayKey ? current.usage.swapsUsed + 1 : 1,
      },
      analytics: trackAnalyticsEvent(current.analytics, 'move_swapped', {
        nextMoveId: next.id,
        system: current.currentSystem,
      }),
    }));
  }

  function startStreakSaverReset() {
    setForcedMove(streakSaverMove);
    setGuidanceVisible(true);
    setTab('today');
    setAppData((current) => ({
      ...current,
      analytics: trackAnalyticsEvent(current.analytics, 'streak_saver_started', {
        credits: current.streakFreeze.credits,
      }),
    }));
  }

  function selectSystem(systemId: SystemId) {
    const track = trackCards.find((card) => card.id === systemId);
    if (!track) return;
    setAppData((current) => ({
      ...current,
      currentSystem: systemId,
      analytics: trackAnalyticsEvent(current.analytics, 'system_selected', {
        system: systemId,
      }),
    }));
    setContext(track.context);
    setForcedMove(null);
    setSelectedMoveId(null);
    setConsecutiveSwaps(0);
    setTab('today');
  }

  function openShare(record: DecisionRecord | null = null) {
    if (record) {
      setShareRecord(record);
      setAppData((current) => ({
        ...current,
        analytics: trackAnalyticsEvent(current.analytics, 'share_open', {
          recordId: record.id,
        }),
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
    });
    setAppData((current) => ({
      ...current,
      analytics: trackAnalyticsEvent(current.analytics, 'share_open', {
        moveId: move.id,
      }),
    }));
  }

  async function performShare() {
    if (!shareRecord) return;
    const shareMessage =
      shareGiftPreview?.shareMessage ??
      `I completed my move today: ${shareRecord.selectedSuggestion.title}. ${shareRecord.selectedSuggestion.action}`;
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
        current.analytics,
        shareGiftPreview ? 'gift_move' : 'share_sent',
        shareGiftPreview ? { code: shareGiftPreview.code } : { recordId: shareRecord.id }
      ),
    }));
    setShareRecord(null);
  }

  async function mockPurchase(plan: Exclude<PlanTier, 'free'>) {
    setAppData((current) => ({
      ...current,
      analytics: trackAnalyticsEvent(current.analytics, 'purchase_attempt', {
        plan,
        liveStore: billing.hasLiveStore,
      }),
    }));

    if (billing.hasLiveStore) {
      try {
        await billing.purchasePlan(plan);
        return;
      } catch (error) {
        Alert.alert(
          'Store unavailable',
          error instanceof Error ? error.message : 'Purchase could not start.'
        );
        return;
      }
    }

    if (Platform.OS !== 'web') {
      Alert.alert(
        'Store connecting',
        'The native store catalog is not ready yet. Please wait a moment and try again.'
      );
      return;
    }

    setAppData((current) => ({
      ...current,
      devPlanPreview: plan,
      subscription: {
        plan,
        productId:
          plan === 'pro-yearly'
            ? 'decido.pro.yearly'
            : plan === 'founding'
              ? 'decido.pro.founding'
              : 'decido.pro.monthly',
        status: 'active',
        source: 'manual',
        lastSyncedAt: new Date().toISOString(),
      },
      analytics: trackAnalyticsEvent(current.analytics, 'purchase_success', {
        plan,
        source: 'manual',
      }),
      streakFreeze: {
        ...current.streakFreeze,
        credits: plan === 'founding' ? 3 : Math.max(current.streakFreeze.credits, 1),
      },
    }));
    setPaywallVisible(false);
    setPendingPaywall(false);
  }

  async function restoreMockPurchase() {
    if (billing.hasLiveStore) {
      try {
        await billing.restore();
        return;
      } catch (error) {
        Alert.alert(
          'Restore failed',
          error instanceof Error ? error.message : 'Could not restore purchases.'
        );
        return;
      }
    }

    if (Platform.OS !== 'web') {
      Alert.alert(
        'Restore unavailable',
        'The native store is not ready yet. Please try restore again in a moment.'
      );
      return;
    }

    const plan = appData.devPlanPreview === 'free' ? 'pro-yearly' : appData.devPlanPreview;
    await mockPurchase(plan as Exclude<PlanTier, 'free'>);
  }

  async function manageSubscription() {
    if (billing.hasLiveStore) {
      try {
        await billing.manage(appData.subscription.productId);
        return;
      } catch (error) {
        Alert.alert(
          'Subscription settings',
          error instanceof Error ? error.message : 'Could not open subscription settings.'
        );
        return;
      }
    }

    if (Platform.OS !== 'web') {
      Alert.alert(
        'Subscription settings',
        'Subscription settings will open once the native store connection is ready.'
      );
      return;
    }

    if (appData.subscription.plan === 'free') {
      setPaywallVisible(true);
      return;
    }
    Alert.alert('Mock subscription', 'Mock Pro is active on this device.');
  }

  function toggleLanguage() {
    setAppData((current) => ({
      ...current,
      language: current.language === 'tr' ? 'en' : 'tr',
    }));
  }

  function closeReward() {
    setReward(null);
    if (pendingPaywall) {
      setPendingPaywall(false);
      setPaywallVisible(true);
    }
  }

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
    projection,
    rewardProfile,
    streak,
    todayGain,
    tomorrowGain,
    tonightLine,
    guidanceVisible,
    setGuidanceVisible,
    focusRunView,
    reward,
    paywallVisible,
    setPaywallVisible,
    shareRecord,
    setShareRecord,
    trackCards,
    dnaCards,
    weeklySummary,
    pending,
    recent,
    analyticsSummary,
    movesRemaining,
    isPro,
    streakSaverEligible,
    streakFreezeCredits: appData.streakFreeze.credits,
    consecutiveSwaps,
    onboardingStep,
    setOnboardingStep,
    onboardingGoal,
    setOnboardingGoal,
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
    selectSystem,
    performShare,
    openShare,
    mockPurchase,
    restoreMockPurchase,
    manageSubscription,
    toggleLanguage,
    closeReward,
    completeOnboarding,
    contextWindowLabel: contextAwareResult.label,
    externalSignals: contextAwareResult.externalSignals,
    personaTitle: personaProfile?.title ?? null,
    personaAuditLine: personaProfile?.auditLine ?? null,
    currentMoveTitle: activeMove?.title ?? copy.today.noMove,
    shareGiftPreview,
    sharePersonaLabel: buildSharePersonaLabel(appData.currentSystem, streak, appData.language),
    paywallPriceLabels: billing.priceLabels,
    storeConnected: billing.hasLiveStore,
    storeCatalogLoaded: billing.catalogLoaded,
    storeError: billing.storeError,
  };
}

function buildSimpleDnaCards(decisions: DecisionRecord[], dnaScores: AppData['dnaScores']) {
  const reviewed = decisions.filter((decision) => decision.reviewedAt);
  if (!reviewed.length) return [];

  const morningDone = reviewed.filter(
    (decision) =>
      new Date(decision.createdAt).getHours() < 12 && decision.completion === 'done'
  ).length;
  const shortDone = reviewed.filter(
    (decision) => decision.selectedSuggestion.minutes <= 10 && decision.completion === 'done'
  ).length;
  const hardAvoid = reviewed.filter((decision) => decision.context.friction === 'avoidant').length;

  return [
    {
      id: 'time',
      eyebrow: 'Best time',
      title: 'Mornings look stronger',
      body: `You have ${morningDone} clean morning closes so far.`,
      metric: `${morningDone} wins`,
    },
    {
      id: 'format',
      eyebrow: 'Best format',
      title: 'Short moves are working',
      body: `Sub-10-minute moves are giving you the cleanest follow-through.`,
      metric: `${shortDone} short wins`,
    },
    {
      id: 'friction',
      eyebrow: 'Main friction',
      title: 'You avoid high-friction tasks',
      body: `Avoidance showed up ${hardAvoid} times. Easier re-entry moves matter.`,
      metric: `${hardAvoid} avoidant moments`,
    },
    {
      id: 'efficiency',
      eyebrow: 'Efficiency',
      title: 'You are getting faster',
      body: 'Finishing under the estimated time increases your efficiency score.',
      metric: `${dnaScores.efficiency}/100`,
    },
    {
      id: 'intuition',
      eyebrow: 'Intuition',
      title: 'You can move without extra explanation',
      body: 'Starting without opening guidance increases your intuition score.',
      metric: `${dnaScores.intuition}/100`,
    },
  ];
}

function buildSimpleWeeklySummary(decisions: DecisionRecord[]) {
  const recent = decisions.filter((decision) => decision.reviewedAt).slice(0, 7);
  if (!recent.length) {
    return {
      title: 'Your momentum is just starting',
      body: 'Complete and score a couple of moves and this section will turn into a real weekly win board.',
    };
  }

  const doneCount = recent.filter((decision) => decision.completion === 'done').length;
  const avgScore =
    Math.round(
      (recent.reduce((sum, decision) => sum + (decision.resultScore ?? 0), 0) / recent.length) * 10
    ) / 10;

  return {
    title: `${doneCount}/${recent.length} moves closed this week`,
    body: `Your average result score is ${avgScore}/5. The app should now be showing cleaner daily move quality.`,
  };
}

function getDateKeyOffset(offset: number) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

function buildSharePersonaLabel(systemId: SystemId, streak: number, language: AppData['language']) {
  if (streak < 7) {
    return language === 'tr' ? 'Bugunun net hamlesi' : "Today's clean move";
  }

  const labels = {
    decide: language === 'tr' ? 'Taktik Mimar' : 'The Tactical Architect',
    learn: language === 'tr' ? 'Sinyal Ustasi' : 'The Signal Builder',
    earn: language === 'tr' ? 'Gelir Stratejisti' : 'The Revenue Strategist',
    move: language === 'tr' ? 'Akis Ustasi' : 'The Flow Master',
    reset: language === 'tr' ? 'Sakin Operator' : 'The Calm Operator',
  } satisfies Record<SystemId, string>;

  return labels[systemId];
}
