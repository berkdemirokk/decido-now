import { Category, DecisionContext, DecisionRecord, Goal, Suggestion, SupportedLanguage } from '../types';

export interface FutureProjection {
  positive: string;
  negative: string;
  teaser: string;
}

export function buildFutureProjection(
  context: DecisionContext,
  suggestion: Suggestion,
  decisions: DecisionRecord[],
  language: SupportedLanguage
): FutureProjection {
  const reviewed = decisions.filter((decision) => decision.reviewedAt);
  const similar = reviewed.filter(
    (decision) =>
      decision.selectedSuggestion.category === suggestion.category || decision.context.goal === context.goal
  );
  const avgScore = similar.length
    ? Number(
        (
          similar.reduce((sum, decision) => sum + (decision.resultScore ?? 0), 0) / similar.length
        ).toFixed(1)
      )
    : null;

  return {
    positive: buildPositiveProjection(context.goal, suggestion.category, language, avgScore),
    negative: buildNegativeProjection(context.goal, suggestion.category, language),
    teaser:
      language === 'tr'
        ? '7 günlük momentum görünümü Pro ile açılır.'
        : 'Unlock the 7-day momentum view with Pro.',
  };
}

function buildPositiveProjection(
  goal: Goal,
  category: Category,
  language: SupportedLanguage,
  avgScore: number | null
) {
  const scoreLine =
    avgScore != null
      ? language === 'tr'
        ? ` Benzer hamlelerde ortalaman şu an ${avgScore}/5 civarında.`
        : ` Similar moves are scoring around ${avgScore}/5 for you right now.`
      : '';

  if (language === 'tr') {
    if (goal === 'earn' || category === 'earn' || category === 'money') {
      return `Bunu bugün kapatırsan, önündeki 7 günde ikinci gelir hamlesi çok daha az dirençle açılır.${scoreLine}`;
    }

    if (goal === 'learn' || category === 'learn' || category === 'language') {
      return `Bunu bugün kapatırsan, önündeki 7 gün öğrenme akışı sıfırdan değil mevcut momentumun üstünden ilerler.${scoreLine}`;
    }

    if (goal === 'reset' || category === 'health' || category === 'reset') {
      return `Bunu bugün kapatırsan, önündeki 7 gün enerji ve karar kalitesi daha temiz bir zeminde çalışır.${scoreLine}`;
    }

    return `Bunu bugün kapatırsan, önündeki 7 günde benzer kararları çok daha hızlı execution’a çevirebilirsin.${scoreLine}`;
  }

  if (goal === 'earn' || category === 'earn' || category === 'money') {
    return `Complete this today and the next 7 days should open a second money move with less resistance.${scoreLine}`;
  }

  if (goal === 'learn' || category === 'learn' || category === 'language') {
    return `Complete this today and the next 7 days should carry more learning momentum instead of forcing a restart.${scoreLine}`;
  }

  if (goal === 'reset' || category === 'health' || category === 'reset') {
    return `Complete this today and the next 7 days may run on cleaner energy and lower drag.${scoreLine}`;
  }

  return `Complete this today and the next 7 days should feel lighter because similar decisions reopen faster.${scoreLine}`;
}

function buildNegativeProjection(goal: Goal, category: Category, language: SupportedLanguage) {
  if (language === 'tr') {
    if (goal === 'earn' || category === 'earn' || category === 'money') {
      return 'Bunu bugün pas geçersen, para tarafındaki sis birkaç gün daha dağılmadan kalabilir.';
    }

    if (goal === 'learn' || category === 'learn' || category === 'language') {
      return 'Bunu bugün pas geçersen, yarın aynı alan yeniden sıfırdan açılacak bir görev gibi hissedebilir.';
    }

    if (goal === 'reset' || category === 'health' || category === 'reset') {
      return 'Bunu bugün pas geçersen, mevcut sürtünme yarına sarkabilir ve başlangıcı ağırlaştırabilir.';
    }

    return 'Bunu bugün pas geçersen, aynı karar yarın daha ağır ve daha pahalı hissedebilir.';
  }

  if (goal === 'earn' || category === 'earn' || category === 'money') {
    return 'Skip this today and the money-side fog may stay vague for a few more days.';
  }

  if (goal === 'learn' || category === 'learn' || category === 'language') {
    return 'Skip this today and this area may feel like a full restart again tomorrow.';
  }

  if (goal === 'reset' || category === 'health' || category === 'reset') {
    return 'Skip this today and the current friction may leak into tomorrow.';
  }

  return 'Skip this today and the same decision may feel heavier tomorrow.';
}
