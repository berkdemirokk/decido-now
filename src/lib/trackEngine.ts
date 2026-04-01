import { Category, DecisionContext, DecisionRecord, Friction, Goal, SupportedLanguage } from '../types';

export interface TrackCard {
  id: 'decide' | 'learn' | 'earn' | 'move' | 'reset';
  title: string;
  body: string;
  promise: string;
  accent: string;
  metric: string;
  pulse: string;
  context: DecisionContext;
}

type TrackDefinition = {
  id: TrackCard['id'];
  title: string;
  accent: string;
  categories: Category[];
  goal: Goal;
  fallbackFriction: Friction;
  mode: DecisionContext['mode'];
  energy: DecisionContext['energy'];
  minutes: number;
  category: Category;
};

const TRACKS: TrackDefinition[] = [
  {
    id: 'decide',
    title: 'Decide',
    accent: '#e9b44c',
    categories: ['focus', 'growth'],
    goal: 'finish',
    fallbackFriction: 'unclear',
    mode: 'quick-win',
    energy: 'mid',
    minutes: 10,
    category: 'focus',
  },
  {
    id: 'learn',
    title: 'Learn',
    accent: '#37c27d',
    categories: ['learn', 'language', 'growth'],
    goal: 'learn',
    fallbackFriction: 'unclear',
    mode: 'quick-win',
    energy: 'mid',
    minutes: 10,
    category: 'learn',
  },
  {
    id: 'earn',
    title: 'Earn',
    accent: '#57a9ff',
    categories: ['earn', 'money'],
    goal: 'earn',
    fallbackFriction: 'avoidant',
    mode: 'bold',
    energy: 'mid',
    minutes: 15,
    category: 'earn',
  },
  {
    id: 'move',
    title: 'Move',
    accent: '#5cc3f1',
    categories: ['health'],
    goal: 'reset',
    fallbackFriction: 'tired',
    mode: 'reset',
    energy: 'low',
    minutes: 10,
    category: 'health',
  },
  {
    id: 'reset',
    title: 'Reset',
    accent: '#7a8cff',
    categories: ['reset', 'social'],
    goal: 'reset',
    fallbackFriction: 'anxious',
    mode: 'reset',
    energy: 'low',
    minutes: 5,
    category: 'reset',
  },
];

export function buildTrackCards(decisions: DecisionRecord[], language: SupportedLanguage): TrackCard[] {
  return TRACKS.map((track) => buildTrackCard(track, decisions, language));
}

function buildTrackCard(
  track: TrackDefinition,
  decisions: DecisionRecord[],
  language: SupportedLanguage
): TrackCard {
  const reviewed = decisions.filter((decision) => decision.reviewedAt);
  const related = reviewed.filter((decision) => track.categories.includes(decision.selectedSuggestion.category));
  const strong = related.filter((decision) => (decision.resultScore ?? 0) >= 4).length;
  const done = related.filter((decision) => decision.completion === 'done').length;
  const avgScore = related.length
    ? Number(
        (
          related.reduce((sum, decision) => sum + (decision.resultScore ?? 0), 0) / related.length
        ).toFixed(1)
      )
    : 0;
  const dominantFriction = getTopKey(related, (decision) => decision.context.friction) ?? track.fallbackFriction;
  const dominantMode = getTopKey(related, (decision) => decision.context.mode) ?? track.mode;
  const dominantEnergy = getTopKey(related, (decision) => decision.context.energy) ?? track.energy;
  const bestMinutes = getBestMinutes(related, track.minutes);

  return {
    id: track.id,
    title: track.title,
    accent: track.accent,
    context: {
      goal: track.goal,
      friction: dominantFriction,
      mode: dominantMode,
      energy: dominantEnergy,
      minutes: bestMinutes,
      budget: 'free',
      category: track.category,
    },
    metric: buildMetric(track.id, related.length, done, avgScore, language),
    pulse: buildPulse(track.id, strong, language),
    body: buildBody(track.id, related.length, dominantFriction, avgScore, language),
    promise: buildPromise(track.id, language),
  };
}

function buildMetric(
  trackId: TrackCard['id'],
  count: number,
  done: number,
  avgScore: number,
  language: SupportedLanguage
) {
  if (count === 0) {
    return language === 'tr' ? 'veri yeni' : 'new lane';
  }

  if (trackId === 'learn') {
    return language === 'tr' ? `${avgScore || 3.8}/5 öğrenme skoru` : `${avgScore || 3.8}/5 learning score`;
  }

  if (trackId === 'earn') {
    return language === 'tr' ? `${done}/${count} gelir hamlesi` : `${done}/${count} earning moves`;
  }

  return language === 'tr' ? `${done}/${count} temiz kapanış` : `${done}/${count} clean closes`;
}

function buildPulse(trackId: TrackCard['id'], strong: number, language: SupportedLanguage) {
  const copy = {
    tr: {
      decide: `${strong} momentum hamlesi`,
      learn: `${strong} güçlü öğrenme sonucu`,
      earn: `${strong} güçlü gelir sinyali`,
      move: `${strong} enerji toparlama`,
      reset: `${strong} sakin kapanış`,
    },
    en: {
      decide: `${strong} momentum moves`,
      learn: `${strong} strong learning results`,
      earn: `${strong} strong earning signals`,
      move: `${strong} energy resets`,
      reset: `${strong} calm resets`,
    },
  } satisfies Record<'tr' | 'en', Record<TrackCard['id'], string>>;

  return copy[language === 'tr' ? 'tr' : 'en'][trackId];
}

function buildBody(
  trackId: TrackCard['id'],
  count: number,
  friction: Friction,
  avgScore: number,
  language: SupportedLanguage
) {
  if (count === 0) {
    return language === 'tr' ? getFallbackTrackBodyTr(trackId) : getFallbackTrackBodyEn(trackId);
  }

  if (language === 'tr') {
    switch (trackId) {
      case 'learn':
        return `Sende öğrenme tarafı özellikle ${describeFrictionTr(friction)} anlarında daha çok yapı istiyor. Bu mod ortalama ${avgScore || 3.8}/5 ile en temiz öğrenme çizgini açar.`;
      case 'earn':
        return `Gelir tarafında seni en çok yavaşlatan nokta ${describeFrictionTr(friction)}. Bu mod teklif, outreach ve para hamlelerini görünür hâle getirir.`;
      case 'move':
        return 'Beden tarafında sende zorlamak değil ritim kurmak çalışıyor. Bu mod düşük sürtünmeli enerji geri girişi verir.';
      case 'reset':
        return 'Reset tarafı büyük motivasyon değil, sakin kapanış ister. Bu mod gürültüyü düşürüp yarının karar kalitesini korur.';
      default:
        return `Karar tarafında sende en iyi çalışan şey kısa ve görünür başlangıçlar. Bu mod ${describeFrictionTr(
          friction
        )} anlarında daha az takılarak ilerlemeyi kolaylaştırır.`;
    }
  }

  switch (trackId) {
    case 'learn':
      return `Your learning lane wants structure in ${describeFrictionEn(friction)} moments. This mode opens the format scoring best for you right now.`;
    case 'earn':
      return `In earning moves, ${describeFrictionEn(friction)} is your main slowdown. This mode turns intent into visible money action.`;
    case 'move':
      return 'Your movement lane works better when it restores rhythm before intensity. This mode opens low-friction energy recovery.';
    case 'reset':
      return 'Your reset lane needs calm closures more than big inspiration. This mode lowers noise so tomorrow starts cleaner.';
    default:
      return `Your decision lane works best with short visible starts. This mode helps you move in ${describeFrictionEn(
        friction
      )} moments without extra overthinking.`;
  }
}

function buildPromise(trackId: TrackCard['id'], language: SupportedLanguage) {
  if (language === 'tr') {
    switch (trackId) {
      case 'learn':
        return 'Bugün elinde somut bir öğrenme çıktısı kalır.';
      case 'earn':
        return 'Bugün para tarafında görünür bir çıkış noktası açılır.';
      case 'move':
        return 'Bugün enerji ve beden tarafı daha hızlı toparlanır.';
      case 'reset':
        return 'Bugün gürültü azalır, yarın daha temiz açılır.';
      default:
        return 'Bugün kararsızlık yerine net bir kapanış görürsün.';
    }
  }

  switch (trackId) {
    case 'learn':
      return 'Leave today with one visible learning win.';
    case 'earn':
      return 'Create one visible money move today.';
    case 'move':
      return 'Finish today with cleaner energy.';
    case 'reset':
      return 'Lower mental noise today so tomorrow starts lighter.';
    default:
      return 'Turn hesitation into one clear visible win today.';
  }
}

function getBestMinutes(decisions: DecisionRecord[], fallback: number) {
  if (!decisions.length) return fallback;
  const buckets = decisions.reduce<Record<string, number>>((accumulator, decision) => {
    const bucket =
      decision.selectedSuggestion.minutes <= 10 ? 'short' : decision.selectedSuggestion.minutes <= 20 ? 'medium' : 'long';
    accumulator[bucket] = (accumulator[bucket] ?? 0) + getContribution(decision);
    return accumulator;
  }, {});
  const best = Object.entries(buckets).sort((left, right) => right[1] - left[1])[0]?.[0];

  if (best === 'long') return 30;
  if (best === 'medium') return 15;
  return 10;
}

function getContribution(decision: DecisionRecord) {
  const completion = decision.completion === 'done' ? 1 : decision.completion === 'partial' ? 0.35 : -0.6;
  const score = decision.resultScore ? (decision.resultScore - 3) * 0.45 : 0;
  return completion + score;
}

function getTopKey<T extends string>(decisions: DecisionRecord[], pick: (decision: DecisionRecord) => T) {
  if (!decisions.length) return null;
  const scores = decisions.reduce<Record<string, number>>((accumulator, decision) => {
    const key = pick(decision);
    accumulator[key] = (accumulator[key] ?? 0) + getContribution(decision);
    return accumulator;
  }, {});
  return Object.entries(scores).sort((left, right) => right[1] - left[1])[0]?.[0] as T | null;
}

function getFallbackTrackBodyTr(trackId: TrackCard['id']) {
  switch (trackId) {
    case 'learn':
      return 'Mini dersler, görünür notlar ve tekrarlanan öğrenme momentumu.';
    case 'earn':
      return 'Teklif, outreach ve gelir tarafına dönük küçük ama görünür hamleler.';
    case 'move':
      return 'Enerjiye göre düşük sürtünmeli hareket, yürüyüş ve toparlanma akışı.';
    case 'reset':
      return 'Overthinking ve zihinsel gürültüyü azaltan sakin kapanış modu.';
    default:
      return 'Takıldığında seni tekrar aksiyona sokan tek net hamle sistemi.';
  }
}

function getFallbackTrackBodyEn(trackId: TrackCard['id']) {
  switch (trackId) {
    case 'learn':
      return 'Micro lessons, visible notes, and repeatable learning momentum.';
    case 'earn':
      return 'Offer, outreach, and earning moves built to become visible today.';
    case 'move':
      return 'Low-friction movement, walking, and recovery based on your energy.';
    case 'reset':
      return 'A calm reset mode for overthinking and mental noise.';
    default:
      return 'One clear system for unsticking yourself and moving now.';
  }
}

function describeFrictionTr(friction: Friction) {
  switch (friction) {
    case 'distracted':
      return 'dikkat dağınıklığı';
    case 'tired':
      return 'düşük enerji';
    case 'anxious':
      return 'kaygı';
    case 'avoidant':
      return 'kaçınma';
    default:
      return 'belirsizlik';
  }
}

function describeFrictionEn(friction: Friction) {
  switch (friction) {
    case 'distracted':
      return 'distracted';
    case 'tired':
      return 'low-energy';
    case 'anxious':
      return 'anxious';
    case 'avoidant':
      return 'avoidant';
    default:
      return 'unclear';
  }
}
