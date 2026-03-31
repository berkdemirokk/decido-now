import { DecisionRecord, RecoveryState, SupportedLanguage } from '../types';

export interface ProgressInsight {
  id: string;
  title: string;
  body: string;
  metric: string;
  premium?: boolean;
}

export interface ProgressSummary {
  completionRate: number;
  recoveryRate: number;
  completedThisWeek: number;
  resetsThisWeek: number;
  bestWindow: string;
  nextAdjustmentTitle: string;
  nextAdjustmentBody: string;
  insights: ProgressInsight[];
}

export function buildProgressSummary(
  decisions: DecisionRecord[],
  recovery: RecoveryState,
  language: SupportedLanguage
): ProgressSummary {
  const reviewed = decisions.filter((decision) => decision.reviewedAt);
  const completed = reviewed.filter((decision) => decision.completion === 'done');
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const weekly = reviewed.filter((decision) => new Date(decision.createdAt) >= weekAgo);
  const completionRate = reviewed.length
    ? Math.round((completed.length / reviewed.length) * 100)
    : 0;
  const recoveryRate = recovery.triggeredCount
    ? Math.round((recovery.completedCount / recovery.triggeredCount) * 100)
    : 0;
  const completedThisWeek = weekly.filter((decision) => decision.completion === 'done').length;
  const resetsThisWeek = weekly.filter((decision) => decision.isRecoveryMove).length;
  const bestWindow = inferBestWindow(completed, language);

  return {
    completionRate,
    recoveryRate,
    completedThisWeek,
    resetsThisWeek,
    bestWindow,
    nextAdjustmentTitle: buildNextAdjustmentTitle(reviewed, language),
    nextAdjustmentBody: buildNextAdjustmentBody(reviewed, recovery, language),
    insights: buildInsights(reviewed, recovery, language, completionRate, bestWindow),
  };
}

function buildInsights(
  reviewed: DecisionRecord[],
  recovery: RecoveryState,
  language: SupportedLanguage,
  completionRate: number,
  bestWindow: string
) {
  const short = reviewed.filter((decision) => decision.selectedSuggestion.minutes <= 10);
  const shortDone = short.filter((decision) => decision.completion === 'done');
  const swapped = reviewed.filter((decision) => (decision.swapCountBeforeSelection ?? 0) > 0);
  const swappedAbandoned = swapped.filter((decision) => decision.focusRunOutcome === 'abandoned');

  const insights: ProgressInsight[] = [];

  if (short.length >= 3) {
    insights.push({
      id: 'short-win-rate',
      title:
        language === 'tr'
          ? 'Kisa hamleler sende daha sert kapaniyor'
          : 'Short moves are closing harder for you',
      body:
        language === 'tr'
          ? '10 dakikanin altindaki hamleler, uzun bloklardan daha sik tamamlandi.'
          : 'Moves under 10 minutes are closing more often than longer blocks.',
      metric: `${shortDone.length}/${short.length}`,
    });
  }

  if (swapped.length >= 2) {
    insights.push({
      id: 'swap-friction',
      title:
        language === 'tr'
          ? 'Fazla swap kapanisi eritiyor'
          : 'Too many swaps are eroding follow-through',
      body:
        language === 'tr'
          ? 'Secimden sonra fazla degistirmek, aksiyon baslangicini yavaslatiyor.'
          : 'Changing lanes after selection is slowing your start quality.',
      metric: `${swappedAbandoned.length}/${swapped.length}`,
    });
  }

  insights.push({
    id: 'best-window',
      title:
        language === 'tr'
          ? 'En guclu penceren netlesiyor'
          : 'Your strongest execution window is getting clearer',
    body:
      language === 'tr'
        ? `${bestWindow} civari daha kolay kapanis cikariyorsun.`
        : `You are closing more moves around ${bestWindow.toLowerCase()}.`,
    metric: bestWindow,
  });

  insights.push({
    id: 'recovery-rate',
      title:
        language === 'tr'
          ? 'Koptugunda ne kadar hizli donuyorsun'
          : 'How fast you return after a crack',
    body:
      language === 'tr'
        ? 'Reset hamleleri ayni gun kullanildiginda ritim daha kolay geri geliyor.'
        : 'Same-day reset moves are helping you get back into motion faster.',
    metric: `${recovery.completedCount}/${Math.max(recovery.triggeredCount, 1)}`,
    premium: true,
  });

  insights.push({
    id: 'completion-rate',
      title:
        language === 'tr'
          ? 'Kapanis oranin'
          : 'Your live close rate',
    body:
      language === 'tr'
        ? 'Bu oran, sistemin sana ne kadar dogru zorlukta hamle verdigini gosterir.'
        : 'This is the clearest signal of whether the system is matching your real friction.',
    metric: `${completionRate}%`,
    premium: true,
  });

  return insights;
}

function buildNextAdjustmentTitle(
  reviewed: DecisionRecord[],
  language: SupportedLanguage
) {
  if (reviewed.length < 3) {
    return language === 'tr' ? 'Once ritmi kilitle' : 'Lock the rhythm first';
  }

  const swapHeavy = reviewed.filter((decision) => (decision.swapCountBeforeSelection ?? 0) > 1).length;
  if (swapHeavy >= 2) {
    return language === 'tr'
      ? 'Secimi daha erken kilitle'
      : 'Lock the choice earlier';
  }

  const lateRuns = reviewed.filter((decision) => new Date(decision.createdAt).getHours() >= 21).length;
  if (lateRuns >= 2) {
    return language === 'tr'
      ? 'Gunu daha erken kapat'
      : 'Close the day earlier';
  }

  return language === 'tr'
    ? 'Ayni formati tekrar et'
    : 'Repeat the format that is working';
}

function buildNextAdjustmentBody(
  reviewed: DecisionRecord[],
  recovery: RecoveryState,
  language: SupportedLanguage
) {
  if (reviewed.length < 3) {
    return language === 'tr'
      ? 'Bir kac kisa hamle daha kapat. Sistem ondan sonra daha sert kaliplar gostermeye baslar.'
      : 'Close a few more short moves. The system gets sharper once it has more clean closes.';
  }

  const swapHeavy = reviewed.filter((decision) => (decision.swapCountBeforeSelection ?? 0) > 1).length;
  if (swapHeavy >= 2) {
    return language === 'tr'
      ? 'Fazla swap seni baslamadan sogutuyor. Ilk temiz secimi daha az boz.'
      : 'Too much swapping is cooling your start. Disturb the first clean choice less.';
  }

  if (recovery.completedCount > 0 && recovery.completedCount >= Math.max(1, recovery.abandonedCount)) {
    return language === 'tr'
      ? 'Ayni gun toparlanma sende ise yariyor. Koptugun anda kisa reset daha erken ac.'
      : 'Same-day recovery works for you. Open a short reset earlier when momentum cracks.';
  }

  return language === 'tr'
    ? '10 dakikanin altindaki net hamleler sende daha guvenli. Zorlugu orada tut.'
    : 'Sub-10-minute moves are giving you cleaner follow-through. Keep the difficulty there.';
}

function inferBestWindow(decisions: DecisionRecord[], language: SupportedLanguage) {
  if (!decisions.length) {
    return language === 'tr' ? 'Sabah' : 'Morning';
  }

  const buckets = decisions.reduce<Record<string, number>>((accumulator, decision) => {
    const hour = new Date(decision.createdAt).getHours();
    const bucket =
      hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : hour < 22 ? 'evening' : 'night';
    accumulator[bucket] = (accumulator[bucket] ?? 0) + 1;
    return accumulator;
  }, {});

  const best = Object.entries(buckets).sort((left, right) => right[1] - left[1])[0]?.[0] ?? 'morning';

  if (language === 'tr') {
    switch (best) {
      case 'afternoon':
        return 'Ogleden sonra';
      case 'evening':
        return 'Aksam';
      case 'night':
        return 'Gece';
      default:
        return 'Sabah';
    }
  }

  return best.charAt(0).toUpperCase() + best.slice(1);
}
