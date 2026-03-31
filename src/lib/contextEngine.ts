import { DecisionContext, Suggestion, SupportedLanguage } from '../types';

export interface MockExternalSignals {
  weatherMood: 'clear' | 'heavy';
  workPressure: 'low' | 'medium' | 'high';
  socialEnergy: 'low' | 'medium' | 'high';
}

export interface ContextAwareResult {
  suggestions: Suggestion[];
  label: string;
  externalSignals: MockExternalSignals;
}

export function applyContextAwareSuggestions(
  suggestions: Suggestion[],
  context: DecisionContext,
  language: SupportedLanguage,
  date = new Date()
): ContextAwareResult {
  const hour = date.getHours();
  const externalSignals = getMockExternalSignals(date);
  let ranked = [...suggestions];
  let label = language === 'tr' ? 'Genel pencere' : 'General window';

  if (hour >= 6 && hour <= 11) {
    label = language === 'tr' ? 'Sabah ivmesi' : 'Morning momentum';
    ranked = ranked.sort((left, right) => getMorningWeight(right) - getMorningWeight(left));
  } else if (hour >= 21 || hour === 0) {
    label = language === 'tr' ? 'Aksam reseti' : 'Evening reset';
    const filtered = ranked.filter((suggestion) => isResetSuggestion(suggestion) || isReflectiveSuggestion(suggestion));
    const resetOnly = ranked.filter((suggestion) => isResetSuggestion(suggestion));
    ranked = filtered.length ? filtered : resetOnly.length ? resetOnly : ranked;
  }

  ranked = ranked
    .map((suggestion) => ({
      suggestion,
      score:
        getSignalWeight(suggestion, externalSignals) +
        (context.goal === 'earn' ? getEarnWeight(suggestion) : 0),
    }))
    .sort((left, right) => right.score - left.score)
    .map((entry) => entry.suggestion);

  return {
    suggestions: ranked,
    label,
    externalSignals,
  };
}

export function getMockExternalSignals(date = new Date()): MockExternalSignals {
  const day = date.getDay();
  const hour = date.getHours();

  return {
    weatherMood: hour < 11 || hour > 19 ? 'clear' : 'heavy',
    workPressure: day >= 1 && day <= 5 && hour >= 9 && hour <= 18 ? 'high' : 'medium',
    socialEnergy: hour >= 19 ? 'low' : 'medium',
  };
}

export function buildDecisionFatigueReset(language: SupportedLanguage): Suggestion {
  if (language === 'tr') {
    return {
      id: 'reset-micro-meditation',
      title: '2 dakikalik karar reseti',
      action: 'Gozlerini kisaca dinlendir, 4 nefes boyunca sadece nefes cikisini say ve sonra tek sonraki hamleye don.',
      reason: 'Arka arkaya swap yapmak karar yorgunlugunu buyutebilir. Kisa reset secim kalitesini temizler.',
      category: 'reset',
      preferredModes: ['reset', 'stuck'],
      energies: ['low', 'mid', 'high'],
      minutes: 2,
      budget: ['free'],
      goals: ['reset', 'finish'],
      frictions: ['distracted', 'anxious', 'avoidant'],
    };
  }

  return {
    id: 'reset-micro-meditation',
    title: '2-minute decision reset',
    action: 'Rest your eyes, count 4 slow exhales, then return to the next move with a cleaner head.',
    reason: 'Too many swaps can increase decision fatigue. A short reset improves selection quality.',
    category: 'reset',
    preferredModes: ['reset', 'stuck'],
    energies: ['low', 'mid', 'high'],
    minutes: 2,
    budget: ['free'],
    goals: ['reset', 'finish'],
    frictions: ['distracted', 'anxious', 'avoidant'],
  };
}

export function buildRecoveryMove(
  language: SupportedLanguage,
  source: 'abandon' | 'missed-day' | 'swap-fatigue'
): Suggestion {
  if (source === 'missed-day') {
    return language === 'tr'
      ? {
          id: 'reset-late-save',
          title: 'Gunu kurtaran 2 dakikalik reset',
          action: 'Bir dakika nefesi duzle, bir dakika bugunu kapatacak tek seyi sec ve hemen uygula.',
          reason: 'Bugun tamamen dusmeden once ritmi korumak icin en kisa geri giris bu.',
          category: 'reset',
          preferredModes: ['reset', 'quick-win'],
          energies: ['low', 'mid', 'high'],
          minutes: 2,
          budget: ['free'],
          goals: ['reset', 'finish'],
          frictions: ['tired', 'avoidant', 'anxious'],
        }
      : {
          id: 'reset-late-save',
          title: '2-minute late save',
          action: 'Spend one minute flattening your breath, then one minute closing the one thing that still saves the day.',
          reason: 'This is the shortest way back before today fully slips.',
          category: 'reset',
          preferredModes: ['reset', 'quick-win'],
          energies: ['low', 'mid', 'high'],
          minutes: 2,
          budget: ['free'],
          goals: ['reset', 'finish'],
          frictions: ['tired', 'avoidant', 'anxious'],
        };
  }

  if (source === 'abandon') {
    return language === 'tr'
      ? {
          id: 'reset-salvage-run',
          title: 'Kosuyu kurtaran mini reset',
          action: 'Yarida kalan kosudan sadece tek parca sec. Onu 2 dakika icinde temiz kapat.',
          reason: 'Yarida kalmis hissi buyumeden ritmi geri almak icin bu daha dogru.',
          category: 'reset',
          preferredModes: ['reset', 'stuck'],
          energies: ['low', 'mid', 'high'],
          minutes: 2,
          budget: ['free'],
          goals: ['finish', 'reset'],
          frictions: ['avoidant', 'distracted', 'anxious'],
        }
      : {
          id: 'reset-salvage-run',
          title: 'Mini salvage reset',
          action: 'Pull one piece out of the unfinished run and close only that piece inside 2 minutes.',
          reason: 'This gets rhythm back before the unfinished feeling spreads.',
          category: 'reset',
          preferredModes: ['reset', 'stuck'],
          energies: ['low', 'mid', 'high'],
          minutes: 2,
          budget: ['free'],
          goals: ['finish', 'reset'],
          frictions: ['avoidant', 'distracted', 'anxious'],
        };
  }

  return buildDecisionFatigueReset(language);
}

function getMorningWeight(suggestion: Suggestion) {
  if (suggestion.category === 'earn' || suggestion.category === 'money') return 5;
  if (suggestion.category === 'health') return 4;
  return 0;
}

function getEarnWeight(suggestion: Suggestion) {
  if (suggestion.category === 'earn' || suggestion.category === 'money') return 4;
  return 0;
}

function getSignalWeight(suggestion: Suggestion, signals: MockExternalSignals) {
  let score = 0;

  if (signals.workPressure === 'high') {
    if (suggestion.category === 'earn' || suggestion.category === 'money') score += 2;
    if (suggestion.category === 'focus') score += 1;
  }

  if (signals.socialEnergy === 'low' && suggestion.category === 'social') {
    score -= 3;
  }

  if (signals.weatherMood === 'heavy') {
    if (suggestion.category === 'reset' || suggestion.category === 'learn') score += 1.5;
    if (suggestion.category === 'health') score -= 1;
  }

  if (signals.weatherMood === 'clear' && suggestion.category === 'health') {
    score += 1.5;
  }

  return score;
}

function isResetSuggestion(suggestion: Suggestion) {
  return suggestion.category === 'reset' || suggestion.category === 'health';
}

function isReflectiveSuggestion(suggestion: Suggestion) {
  const source = `${suggestion.title} ${suggestion.action}`.toLowerCase();
  return (
    source.includes('note') ||
    source.includes('review') ||
    source.includes('summary') ||
    source.includes('ozet') ||
    source.includes('not') ||
    source.includes('dump') ||
    source.includes('journal') ||
    source.includes('reflect')
  );
}
