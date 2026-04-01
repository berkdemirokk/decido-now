import { DecisionRecord, RecoveryState, SupportedLanguage } from '../types';

export interface BehaviorProfile {
  executionScore: number;
  stabilityScore: number;
  driftScore: number;
  momentumState: 'rising' | 'stable' | 'fragile' | 'cracked';
  momentumTitle: string;
  momentumBody: string;
  identityTitle: string;
  identityBody: string;
  lossLine: string | null;
  returnPull: string;
}

export function buildBehaviorProfile(
  decisions: DecisionRecord[],
  recovery: RecoveryState,
  streak: number,
  language: SupportedLanguage
): BehaviorProfile {
  const reviewed = decisions.filter((decision) => decision.reviewedAt).slice(0, 14);
  const last = reviewed[0] ?? null;
  const doneCount = reviewed.filter((decision) => decision.completion === 'done').length;
  const partialCount = reviewed.filter((decision) => decision.completion === 'partial').length;
  const abandonedCount = reviewed.filter((decision) => decision.focusRunOutcome === 'abandoned').length;
  const skipCount = reviewed.filter((decision) => decision.completion === 'skipped').length;
  const swapHeavyCount = reviewed.filter((decision) => (decision.swapCountBeforeSelection ?? 0) > 1).length;
  const recoveryBoost = Math.min(recovery.completedCount * 2, 12);

  const executionScore = clamp(
    52 + doneCount * 6 + partialCount * 2 - abandonedCount * 6 - skipCount * 4 + recoveryBoost,
    18,
    98
  );
  const stabilityScore = clamp(
    56 + streak * 2 + doneCount * 3 - swapHeavyCount * 4 - abandonedCount * 5,
    16,
    96
  );
  const driftScore = clamp(
    50 + abandonedCount * 8 + skipCount * 6 + swapHeavyCount * 4 - doneCount * 2 - recoveryBoost,
    4,
    96
  );

  const momentumState = inferMomentumState(last, executionScore, driftScore, streak);

  return {
    executionScore,
    stabilityScore,
    driftScore,
    momentumState,
    momentumTitle: getMomentumTitle(momentumState, language),
    momentumBody: getMomentumBody(momentumState, executionScore, stabilityScore, driftScore, language),
    identityTitle: getIdentityTitle(executionScore, stabilityScore, driftScore, recovery, language),
    identityBody: getIdentityBody(executionScore, stabilityScore, driftScore, recovery, language),
    lossLine: getLossLine(last, language),
    returnPull: getReturnPull(momentumState, streak, language),
  };
}

function inferMomentumState(
  last: DecisionRecord | null,
  executionScore: number,
  driftScore: number,
  streak: number
): BehaviorProfile['momentumState'] {
  if (last?.focusRunOutcome === 'abandoned' || last?.completion === 'skipped') {
    return 'cracked';
  }
  if (driftScore >= 62) {
    return 'fragile';
  }
  if (executionScore >= 72 && streak >= 3) {
    return 'rising';
  }
  return 'stable';
}

function getMomentumTitle(state: BehaviorProfile['momentumState'], language: SupportedLanguage) {
  const copy = {
    rising: { tr: 'Momentum yükseliyor', en: 'Momentum is rising' },
    stable: { tr: 'Ritim korunuyor', en: 'Rhythm is holding' },
    fragile: { tr: 'Ritim inceldi', en: 'Rhythm is fragile' },
    cracked: { tr: 'Momentum çatladı', en: 'Momentum cracked' },
  } as const;

  return copy[state][language === 'tr' ? 'tr' : 'en'];
}

function getMomentumBody(
  state: BehaviorProfile['momentumState'],
  executionScore: number,
  stabilityScore: number,
  driftScore: number,
  language: SupportedLanguage
) {
  if (language === 'tr') {
    switch (state) {
      case 'rising':
        return `Execution skoru ${executionScore}. İstikrar ${stabilityScore}. Sistem artık daha sert bir tempo taşıyabildiğini görüyor.`;
      case 'fragile':
        return `Drift ${driftScore}. Bugün tek temiz kapanış daha alırsan ritim yeniden oturur.`;
      case 'cracked':
        return `Execution ${executionScore} seviyesine indi. Bugün hızlı bir toparlanma hamlesi şart.`;
      default:
        return `Execution ${executionScore}. İstikrar ${stabilityScore}. Tek temiz kapanış bu paneli yukarı iter.`;
    }
  }

  switch (state) {
    case 'rising':
      return `Execution score ${executionScore}. Stability ${stabilityScore}. The system is starting to trust you with harder moves.`;
    case 'fragile':
      return `Drift ${driftScore}. One clean close today can stabilize the rhythm again.`;
    case 'cracked':
      return `Execution is down to ${executionScore}. A same-day recovery move matters now.`;
    default:
      return `Execution ${executionScore}. Stability ${stabilityScore}. One clean close can still move this panel up.`;
  }
}

function getIdentityTitle(
  executionScore: number,
  stabilityScore: number,
  driftScore: number,
  recovery: RecoveryState,
  language: SupportedLanguage
) {
  if (executionScore >= 76 && stabilityScore >= 68) {
    return language === 'tr'
      ? 'Execution sende varsayılan olmaya başlıyor'
      : 'Execution is becoming your default';
  }

  if (recovery.completedCount >= Math.max(1, recovery.abandonedCount)) {
    return language === 'tr'
      ? 'Koptuğunda geri dönmeyi öğreniyorsun'
      : 'You are learning how to recover fast';
  }

  if (driftScore >= 62) {
    return language === 'tr'
      ? 'Hâlâ fazla momentum kaçırıyorsun'
      : 'You are still leaking too much momentum';
  }

  return language === 'tr'
    ? 'Ritim kuruluyor ama daha sertleşebilir'
    : 'You are building rhythm, but it can still harden';
}

function getIdentityBody(
  executionScore: number,
  stabilityScore: number,
  driftScore: number,
  recovery: RecoveryState,
  language: SupportedLanguage
) {
  if (executionScore >= 76 && stabilityScore >= 68) {
    return language === 'tr'
      ? 'Kısa ve net hamleler sende tereddüdü otomatik harekete çevirmeye başlıyor.'
      : 'Short clean moves are starting to replace hesitation with automatic follow-through.';
  }

  if (recovery.completedCount >= Math.max(1, recovery.abandonedCount)) {
    return language === 'tr'
      ? 'Bu güçlü bir sinyal. Kaydığında geri giriş kasın zayıflamıyor, güçleniyor.'
      : 'That is a strong sign. When you slip, your re-entry muscle is getting stronger instead of weaker.';
  }

  if (driftScore >= 62) {
    return language === 'tr'
      ? 'Fazla swap ve geç çıkış seni aşağı çekiyor. Daha erken kilit, daha hızlı kapanış.'
      : 'Too much swapping and late exits are dragging you down. Lock earlier, close faster.';
  }

  return language === 'tr'
    ? 'Sistem sende neyin gerçekten kapandığını öğreniyor. Sıradaki iş, temiz kapanışları sıklaştırmak.'
    : 'The system is learning what actually closes for you. The next move is more clean closes.';
}

function getLossLine(last: DecisionRecord | null, language: SupportedLanguage) {
  if (!last) return null;

  if (last.focusRunOutcome === 'abandoned') {
    return language === 'tr'
      ? 'Son koşu yarı yolda kırıldı. Execution skoru darbe aldı.'
      : 'Your last run broke early. Execution score took a hit.';
  }

  if (last.completion === 'skipped') {
    return language === 'tr'
      ? 'Son hamle açıldı ama kapanmadı. Drift yükseliyor.'
      : 'Your last move opened but did not close. Drift is rising.';
  }

  if (last.focusRunOutcome === 'partial') {
    return language === 'tr'
      ? 'Kısmi kapanış ritmi tuttu ama tam kazanç çıkmadı.'
      : 'Partial completion protected the rhythm, but the full gain did not land.';
  }

  return null;
}

function getReturnPull(
  state: BehaviorProfile['momentumState'],
  streak: number,
  language: SupportedLanguage
) {
  if (language === 'tr') {
    if (state === 'rising') {
      return streak >= 5
        ? `${streak} günlük seri büyüyor. Bugünkü temiz kapanış bu kimliği daha da sertleştirir.`
        : 'Bugünkü temiz kapanış ritmi yarına taşır.';
    }

    if (state === 'cracked') {
      return 'Bugün alacağın tek toparlanma hamlesi kaybı büyümeden keser.';
    }

    return 'Yarını daha kolay istiyorsan bugünü temiz kapat.';
  }

  if (state === 'rising') {
    return streak >= 5
      ? `${streak}-day streak is growing. A clean close today hardens the identity.`
      : 'A clean close today makes the rhythm more durable tomorrow.';
  }

  if (state === 'cracked') {
    return 'One recovery move today can stop the loss from spreading.';
  }

  return 'If you want tomorrow easier, close today cleanly.';
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(value)));
}
