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
      decision.selectedSuggestion.category === suggestion.category ||
      decision.context.goal === context.goal
  );
  const avgScore = similar.length
    ? Number(
        (
          similar.reduce((sum, decision) => sum + (decision.resultScore ?? 0), 0) / similar.length
        ).toFixed(1)
      )
    : null;

  const positive = buildPositiveProjection(context.goal, suggestion.category, language, avgScore);
  const negative = buildNegativeProjection(context.goal, suggestion.category, language);
  const teaser =
    language === 'tr'
      ? '7 gunluk momentum gorunumu Pro ile acilir.'
      : 'Unlock your 7-day momentum view with Pro.';

  return { positive, negative, teaser };
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
        ? ` Benzer hamlelerin ortalama skoru su an ${avgScore}/5 civarinda.`
        : ` Similar moves are scoring around ${avgScore}/5 for you right now.`
      : '';

  if (language === 'tr') {
    if (goal === 'earn' || category === 'earn' || category === 'money') {
      return `Bugun bu hamleyi tamamlarsan, sonraki 7 gunde gelir veya para tarafinda ikinci bir gorunur adim atman daha kolaylasabilir.${scoreLine}`;
    }

    if (goal === 'learn' || category === 'learn' || category === 'language') {
      return `Bugun bu hamleyi tamamlarsan, sonraki 7 gunde ogrenme akisini sifirdan degil, mevcut momentumun ustunden devam ettirebilirsin.${scoreLine}`;
    }

    if (goal === 'reset' || category === 'health' || category === 'reset') {
      return `Bugun bu hamleyi tamamlarsan, sonraki 7 gunde enerji ve zihinsel aciklik tarafinda daha temiz baslangiclar gorebilirsin.${scoreLine}`;
    }

    return `Bugun bu hamleyi tamamlarsan, sonraki 7 gunde karar alma surtunmesi azalabilir ve benzer adimlara daha hizli girebilirsin.${scoreLine}`;
  }

  if (goal === 'earn' || category === 'earn' || category === 'money') {
    return `If you complete this today, the next 7 days may feel easier for a second visible money or earning move.${scoreLine}`;
  }

  if (goal === 'learn' || category === 'learn' || category === 'language') {
    return `If you complete this today, the next 7 days may carry more learning momentum instead of forcing you to restart.${scoreLine}`;
  }

  if (goal === 'reset' || category === 'health' || category === 'reset') {
    return `If you complete this today, the next 7 days may start with cleaner energy and lower friction.${scoreLine}`;
  }

  return `If you complete this today, the next 7 days may feel lighter because similar decisions become easier to re-enter.${scoreLine}`;
}

function buildNegativeProjection(goal: Goal, category: Category, language: SupportedLanguage) {
  if (language === 'tr') {
    if (goal === 'earn' || category === 'earn' || category === 'money') {
      return 'Bugun pas gecersen, para tarafindaki belirsizlik ve ertelenen cikis hissi bir kac gun daha uzayabilir.';
    }

    if (goal === 'learn' || category === 'learn' || category === 'language') {
      return 'Bugun pas gecersen, bu alan yarin yeniden sifirdan baslanacak bir gorev gibi hissedebilir.';
    }

    if (goal === 'reset' || category === 'health' || category === 'reset') {
      return 'Bugun pas gecersen, zihinsel ya da bedensel surtunme yarina tasinabilir.';
    }

    return 'Bugun pas gecersen, ayni konuda karar vermek yarin daha agir hissedebilir.';
  }

  if (goal === 'earn' || category === 'earn' || category === 'money') {
    return 'If you skip today, the money-side hesitation may stay vague for a few more days.';
  }

  if (goal === 'learn' || category === 'learn' || category === 'language') {
    return 'If you skip today, this area may feel like a fresh restart again tomorrow.';
  }

  if (goal === 'reset' || category === 'health' || category === 'reset') {
    return 'If you skip today, the current mental or physical friction may carry into tomorrow.';
  }

  return 'If you skip today, the same decision may feel heavier tomorrow.';
}
