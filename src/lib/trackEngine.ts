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
    accent: '#f59e0b',
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
    accent: '#22c55e',
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
    accent: '#38bdf8',
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
    accent: '#f97316',
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
    accent: '#a78bfa',
    categories: ['reset', 'social'],
    goal: 'reset',
    fallbackFriction: 'anxious',
    mode: 'reset',
    energy: 'low',
    minutes: 5,
    category: 'reset',
  },
];

export function buildTrackCards(
  decisions: DecisionRecord[],
  language: SupportedLanguage
): TrackCard[] {
  return TRACKS.map((track) => buildTrackCard(track, decisions, language));
}

function buildTrackCard(
  track: TrackDefinition,
  decisions: DecisionRecord[],
  language: SupportedLanguage
): TrackCard {
  const reviewed = decisions.filter((decision) => decision.reviewedAt);
  const related = reviewed.filter((decision) =>
    track.categories.includes(decision.selectedSuggestion.category)
  );
  const strong = related.filter((decision) => (decision.resultScore ?? 0) >= 4).length;
  const done = related.filter((decision) => decision.completion === 'done').length;
  const avgScore = related.length
    ? Number(
        (
          related.reduce((sum, decision) => sum + (decision.resultScore ?? 0), 0) / related.length
        ).toFixed(1)
      )
    : 0;
  const dominantFriction =
    getTopKey(related, (decision) => decision.context.friction) ?? track.fallbackFriction;
  const dominantMode = getTopKey(related, (decision) => decision.context.mode) ?? track.mode;
  const dominantEnergy = getTopKey(related, (decision) => decision.context.energy) ?? track.energy;
  const bestMinutes = getBestMinutes(related, track.minutes);

  const context: DecisionContext = {
    goal: track.goal,
    friction: dominantFriction,
    mode: dominantMode,
    energy: dominantEnergy,
    minutes: bestMinutes,
    budget: 'free',
    category: track.category,
  };

  return {
    id: track.id,
    title: track.title,
    accent: track.accent,
    context,
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

  if (trackId === 'earn') {
    return language === 'tr'
      ? `${done}/${count} gelir hamlesi`
      : `${done}/${count} earning moves`;
  }

  if (trackId === 'learn') {
    return language === 'tr'
      ? `${avgScore || 3.8}/5 ogrenme skoru`
      : `${avgScore || 3.8}/5 learning score`;
  }

  return language === 'tr' ? `${done}/${count} temiz kapanis` : `${done}/${count} clean closes`;
}

function buildPulse(trackId: TrackCard['id'], strong: number, language: SupportedLanguage) {
  if (trackId === 'learn') {
    return language === 'tr'
      ? `${strong} guclu ogrenme sonucu`
      : `${strong} strong learning results`;
  }

  if (trackId === 'earn') {
    return language === 'tr'
      ? `${strong} guclu gelir sinyali`
      : `${strong} strong earning signals`;
  }

  if (trackId === 'move') {
    return language === 'tr' ? `${strong} enerji toparlama` : `${strong} energy resets`;
  }

  if (trackId === 'reset') {
    return language === 'tr' ? `${strong} sakin kapanis` : `${strong} calm resets`;
  }

  return language === 'tr' ? `${strong} momentum hamlesi` : `${strong} momentum moves`;
}

function buildBody(
  trackId: TrackCard['id'],
  count: number,
  friction: Friction,
  avgScore: number,
  language: SupportedLanguage
) {
  if (count === 0) {
    return language === 'tr'
      ? getFallbackTrackBodyTr(trackId)
      : getFallbackTrackBodyEn(trackId);
  }

  if (language === 'tr') {
    switch (trackId) {
      case 'learn':
        return `Sende öğrenme tarafı özellikle ${describeFrictionTr(friction)} anlarında daha çok yapı ve tekrar istiyor. Bu track şu an ortalama ${avgScore || 3.8}/5 ile en net öğrenme formatını açar.`;
      case 'earn':
        return `Gelir tarafında seni en çok yavaşlatan nokta ${describeFrictionTr(friction)}. Bu track teklif, outreach ve para hamlelerini daha görünür ve gönderilebilir hale getirir.`;
      case 'move':
        return `Hareket tarafında vücudu zorlamak değil, ritim kurmak sende daha iyi çalışıyor. Bu track düşük sürtünmeli enerji geri kazanımını açar.`;
      case 'reset':
        return `Reset tarafında sistemin asıl ihtiyacı sakin kapanışlar. Bu track zihinsel gürültüyü indirip yarının karar kalitesini korur.`;
      default:
        return `Karar tarafında sende en iyi çalışan şey kısa ve görünür başlangıçlar. Bu track ${describeFrictionTr(friction)} anlarında fazla düşünmeden harekete geçmeni kolaylaştırır.`;
    }
  }

  switch (trackId) {
    case 'learn':
      return `Your learning lane works better when it has structure and repetition, especially in ${describeFrictionEn(friction)} moments. This track opens the format that is scoring best for you right now.`;
    case 'earn':
      return `In earning moves, ${describeFrictionEn(friction)} is your main slowdown. This track turns offers, outreach, and money moves into something more visible and sendable.`;
    case 'move':
      return `Your movement lane works better when it restores rhythm before intensity. This track opens low-friction energy recovery.`;
    case 'reset':
      return `Your reset lane needs calm closures more than big inspiration. This track lowers mental noise so tomorrow starts cleaner.`;
    default:
      return `Your decision lane works best with short visible starts. This track is tuned to help you move without extra overthinking in ${describeFrictionEn(friction)} moments.`;
  }
}

function buildPromise(trackId: TrackCard['id'], language: SupportedLanguage) {
  if (language === 'tr') {
    switch (trackId) {
      case 'learn':
        return 'Bugun elinde somut bir ogrenme cikisi kalir.';
      case 'earn':
        return 'Bugun para ya da gelir tarafinda gorunur bir cikis noktasi yaratilabilir.';
      case 'move':
        return 'Bugun enerji ve beden tarafinda gorunur bir toparlanma elde edebilirsin.';
      case 'reset':
        return 'Bugun zihinsel gurultuyu dusurup yarini hafifletebilirsin.';
      default:
        return 'Bugun kararsizlik yerine net bir kapanis gorebilirsin.';
    }
  }

  switch (trackId) {
    case 'learn':
      return 'Leave today with one visible learning win.';
    case 'earn':
      return 'Create one visible money or earning move today.';
    case 'move':
      return 'Finish today with cleaner energy and body momentum.';
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
      decision.selectedSuggestion.minutes <= 10
        ? 'short'
        : decision.selectedSuggestion.minutes <= 20
          ? 'medium'
          : 'long';
    accumulator[bucket] = (accumulator[bucket] ?? 0) + getContribution(decision);
    return accumulator;
  }, {});
  const best = Object.entries(buckets).sort((left, right) => right[1] - left[1])[0]?.[0];

  if (best === 'long') return 30;
  if (best === 'medium') return 15;
  return 10;
}

function getContribution(decision: DecisionRecord) {
  const completion =
    decision.completion === 'done' ? 1 : decision.completion === 'partial' ? 0.35 : -0.6;
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
      return 'Mini dersler, görünür notlar ve tekrar eden öğrenme momentumu.';
    case 'earn':
      return 'Teklif, outreach ve gelir üretmeye dönük küçük ama görünür hamleler.';
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
