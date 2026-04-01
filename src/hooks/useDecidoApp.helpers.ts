import { AppData, DecisionRecord, GrowthDirectionId } from '../types';

export interface FocusRunState {
  visible: boolean;
  move: import('../types').Suggestion | null;
  steps: string[];
  totalSeconds: number;
  secondsLeft: number;
  currentStep: number;
  phase: 'prestart' | 'active' | 'halfway' | 'nearFinish' | 'score' | 'leaveConfirm';
  easyMode: boolean;
  usedGuidance: boolean;
  committedAt: string | null;
  isRecovery: boolean;
}

export interface PaywallState {
  visible: boolean;
  mode: import('../types').PaywallMode;
  source: string | null;
}

export interface RecoveryPrompt {
  title: string;
  body: string;
  cta: string;
  source: 'abandon' | 'missed-day' | 'swap-fatigue';
  premiumProtected: boolean;
}

export function createEmptyFocusRun(): FocusRunState {
  return {
    visible: false,
    move: null,
    steps: [],
    totalSeconds: 0,
    secondsLeft: 0,
    currentStep: 0,
    phase: 'prestart',
    easyMode: false,
    usedGuidance: false,
    committedAt: null,
    isRecovery: false,
  };
}

export function buildSimpleDnaCards(
  decisions: DecisionRecord[],
  dnaScores: AppData['dnaScores'],
  language: AppData['language'],
  premiumInsights: boolean
) {
  const reviewed = decisions.filter((decision) => decision.reviewedAt);
  if (!reviewed.length) return [];

  const morningDone = reviewed.filter(
    (decision) =>
      new Date(decision.createdAt).getHours() < 12 && decision.completion === 'done'
  ).length;
  const shortDone = reviewed.filter(
    (decision) => decision.selectedSuggestion.minutes <= 10 && decision.completion === 'done'
  ).length;
  const avoidantMoments = reviewed.filter(
    (decision) => decision.context.friction === 'avoidant'
  ).length;
  const lockedMetric = language === 'tr' ? 'Kilitli' : 'Locked';

  return [
    {
      id: 'time',
      eyebrow: language === 'tr' ? 'En iyi pencere' : 'Best window',
      title: language === 'tr' ? 'Sabah kapanışları daha temiz' : 'Morning closes are cleaner',
      body:
        language === 'tr'
          ? `Şimdiye kadar ${morningDone} temiz sabah kapanışı birikti.`
          : `You already stacked ${morningDone} clean morning closes.`,
      metric: `${morningDone}`,
    },
    {
      id: 'format',
      eyebrow: language === 'tr' ? 'En iyi format' : 'Best format',
      title:
        language === 'tr'
          ? 'Kısa hamleler sende daha iyi kapanıyor'
          : 'Short moves are closing harder for you',
      body:
        language === 'tr'
          ? '10 dakikanın altındaki hamleler daha fazla temiz kapanış üretiyor.'
          : 'Sub-10-minute moves are creating cleaner follow-through.',
      metric: `${shortDone}`,
    },
    {
      id: 'friction',
      eyebrow: language === 'tr' ? 'Sürtünme' : 'Main friction',
      title:
        language === 'tr'
          ? 'Yüksek direnci olan şeyleri geç açıyorsun'
          : 'You are still opening high-resistance tasks late',
      body:
        language === 'tr'
          ? `Kaçınma ${avoidantMoments} kez görüldü. Daha hafif geri girişler kritik.`
          : `Avoidance showed up ${avoidantMoments} times. Easier re-entry moves matter.`,
      metric: `${avoidantMoments}`,
    },
    {
      id: 'efficiency',
      eyebrow: 'DNA',
      title:
        language === 'tr'
          ? 'Verimlilik puanı daha derin veride açılır'
          : 'Efficiency unlocks with deeper pattern data',
      body:
        language === 'tr'
          ? 'Tahminden hızlı bitirdiğin bloklar verimliliği yükseltiyor.'
          : 'Finishing faster than the estimate raises your efficiency score.',
      metric: premiumInsights ? `${dnaScores.efficiency}/100` : lockedMetric,
    },
    {
      id: 'intuition',
      eyebrow: 'DNA',
      title:
        language === 'tr'
          ? 'Sezgi puanı fazla açıklama istemediğinde büyüyor'
          : 'Intuition grows when you stop asking for more explanation',
      body:
        language === 'tr'
          ? 'Neden ekranına girmeden başlamak sezgi güvenini güçlendirir.'
          : 'Starting without opening guidance builds intuitive trust.',
      metric: premiumInsights ? `${dnaScores.intuition}/100` : lockedMetric,
    },
  ];
}

export function buildSimpleWeeklySummary(decisions: DecisionRecord[], language: AppData['language']) {
  const recent = decisions.filter((decision) => decision.reviewedAt).slice(0, 7);
  if (!recent.length) {
    return {
      title:
        language === 'tr'
          ? 'Ritim yeni kuruluyor'
          : 'Your rhythm is just forming',
      body:
        language === 'tr'
          ? 'Birkaç skorlanan hamleden sonra hangi formatın sende daha temiz kapandığı netleşir.'
          : 'After a few scored moves, the system can tell which format really closes better for you.',
    };
  }

  const doneCount = recent.filter((decision) => decision.completion === 'done').length;
  const avgScore =
    Math.round(
      (recent.reduce((sum, decision) => sum + (decision.resultScore ?? 0), 0) / recent.length) *
        10
    ) / 10;

  return {
    title:
      language === 'tr'
        ? `Bu hafta ${doneCount}/${recent.length} hamle temiz kapandı`
        : `${doneCount}/${recent.length} moves closed this week`,
    body:
      language === 'tr'
        ? `Ortalama skorun ${avgScore}/5. Sistem artık hangi zorluğun sende çalıştığını daha net okuyor.`
        : `Your average score is ${avgScore}/5. The system is reading which level of pressure actually works for you.`,
  };
}

export function buildTonightLine(
  language: AppData['language'],
  pendingCount: number,
  completionRate: number
) {
  if (pendingCount > 0) {
    return language === 'tr'
      ? `${pendingCount} hamle bu akşam skor bekliyor. Asıl keskinleşme burada oluyor.`
      : `${pendingCount} moves are waiting for a score tonight. This is where the system sharpens.`;
  }

  return language === 'tr'
    ? `Bugünlük kapanış oranın %${completionRate}. Gece gireceğin bir skor daha yarının hamlesini temizler.`
    : `Your close rate is ${completionRate}% today. One score tonight makes tomorrow cleaner.`;
}

export function buildSharePersonaLabel(
  directionId: GrowthDirectionId,
  streak: number,
  language: AppData['language']
) {
  if (streak < 7) {
    return language === 'tr' ? 'Bugünün net hamlesi' : "Today's clean move";
  }

  const labels = {
    mind: language === 'tr' ? 'Zihin Mimarı' : 'The Pattern Builder',
    body: language === 'tr' ? 'Ritim Kurucu' : 'The Flow Engine',
    social: language === 'tr' ? 'Bağ Kurucu' : 'The Social Operator',
    money: language === 'tr' ? 'Gelir Operatörü' : 'The Revenue Operator',
    reset: language === 'tr' ? 'Sakin Operatör' : 'The Calm Operator',
  } satisfies Record<GrowthDirectionId, string>;

  return labels[directionId];
}
