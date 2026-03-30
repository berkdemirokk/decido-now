import { CATEGORY_LABELS } from './decisionEngine';
import { DecisionRecord, Friction, Goal, InsightCard } from '../types';

const timeSegments = [
  { key: 'morning', label: 'Sabah akisi', start: 5, end: 12 },
  { key: 'afternoon', label: 'Gun ici', start: 12, end: 18 },
  { key: 'evening', label: 'Aksam akisi', start: 18, end: 24 },
  { key: 'night', label: 'Gece modu', start: 0, end: 5 },
];

const goalLabels: Record<Goal, string> = {
  finish: 'Bitirme modu',
  learn: 'Ogrenme modu',
  earn: 'Gelir modu',
  reset: 'Toparlanma modu',
  connect: 'Bag kurma modu',
  build: 'Uretim modu',
};

const frictionLabels: Record<Friction, string> = {
  unclear: 'Belirsizlik',
  distracted: 'Dikkat daginikligi',
  tired: 'Dusuk enerji',
  anxious: 'Kaygi',
  avoidant: 'Kacinma',
};

export function getDecisionStreak(decisions: DecisionRecord[]) {
  const completedDays = Array.from(
    new Set(
      decisions
        .filter((decision) => decision.completion === 'done')
        .map((decision) => decision.dateKey)
    )
  ).sort((left, right) => right.localeCompare(left));

  let streak = 0;
  const cursor = new Date();

  while (true) {
    const dateKey = cursor.toISOString().slice(0, 10);

    if (!completedDays.includes(dateKey)) {
      break;
    }

    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function buildDecisionDNA(decisions: DecisionRecord[]) {
  const reviewed = decisions.filter((decision) => decision.reviewedAt);

  if (reviewed.length < 5) {
    return {
      ready: false,
      reviewedCount: reviewed.length,
      cards: [] as InsightCard[],
      summary:
        'DNA olusuyor. Biraz daha karar yap ve sonucunu isle; sistem sonra seni hangi kosullarda harekete gecirdigini gosterecek.',
    };
  }

  const bestSegment = findBestTimeSegment(reviewed);
  const bestGoal = findBestGoal(reviewed);
  const frictionPattern = findFrictionPattern(reviewed);
  const bestCategory = findBestCategory(reviewed);
  const bestFormat = findBestFormat(reviewed);

  const cards: InsightCard[] = [
    {
      id: 'time',
      eyebrow: 'En verimli zaman',
      title: bestSegment.label,
      body: `${bestSegment.label} saatlerinde kararlarini daha temiz tamamlama egilimindesin.`,
      metric: `${bestSegment.metric}% guc`,
    },
    {
      id: 'goal',
      eyebrow: 'En guclu niyet',
      title: goalLabels[bestGoal.goal],
      body: 'Bu niyetle girdigin kararlar sende daha cok aksiyona donusuyor.',
      metric: `${bestGoal.metric}% geri donus`,
    },
    {
      id: 'friction',
      eyebrow: 'Seni en cok tutan sey',
      title: frictionLabels[frictionPattern.friction],
      body: frictionPattern.body,
      metric: `${frictionPattern.metric}% surtunme`,
    },
    {
      id: 'category',
      eyebrow: 'En guclu alan',
      title: CATEGORY_LABELS[bestCategory.category],
      body: 'Bu kategori, son kararlarinda sana en cok hareket ureten alan oldu.',
      metric: `${bestCategory.metric}% guc`,
    },
    {
      id: 'format',
      eyebrow: 'Sana en uygun format',
      title: bestFormat.title,
      body: bestFormat.body,
      metric: bestFormat.metric,
    },
  ];

  return {
    ready: true,
    reviewedCount: reviewed.length,
    cards,
    summary: `${bestSegment.label} saatlerinde ${goalLabels[bestGoal.goal].toLowerCase()} odakli kararlar sende en iyi sonucu veriyor.`,
  };
}

function findBestTimeSegment(decisions: DecisionRecord[]) {
  const results = timeSegments.map((segment) => {
    const filtered = decisions.filter((decision) => {
      const hour = new Date(decision.createdAt).getHours();

      if (segment.key === 'night') {
        return hour < segment.end;
      }

      return hour >= segment.start && hour < segment.end;
    });

    return {
      label: segment.label,
      metric: completionRate(filtered),
      count: filtered.length,
    };
  });

  return results
    .filter((result) => result.count > 0)
    .sort((left, right) => right.metric - left.metric)[0];
}

function findBestGoal(decisions: DecisionRecord[]) {
  const entries = Object.entries(
    decisions.reduce<Record<string, DecisionRecord[]>>((accumulator, decision) => {
      const key = decision.context.goal;
      accumulator[key] = [...(accumulator[key] ?? []), decision];
      return accumulator;
    }, {})
  ).map(([goal, items]) => ({
    goal: goal as Goal,
    metric: completionRate(items),
    count: items.length,
  }));

  return entries.sort((left, right) => right.metric - left.metric)[0];
}

function findFrictionPattern(decisions: DecisionRecord[]) {
  const entries = Object.entries(
    decisions.reduce<Record<string, DecisionRecord[]>>((accumulator, decision) => {
      const key = decision.context.friction;
      accumulator[key] = [...(accumulator[key] ?? []), decision];
      return accumulator;
    }, {})
  ).map(([friction, items]) => ({
    friction: friction as Friction,
    metric: 100 - completionRate(items),
    count: items.length,
    body: buildFrictionBody(friction as Friction),
  }));

  return entries.sort((left, right) => right.metric - left.metric)[0];
}

function findBestCategory(decisions: DecisionRecord[]) {
  const entries = Object.entries(
    decisions.reduce<Record<string, DecisionRecord[]>>((accumulator, decision) => {
      const key = decision.selectedSuggestion.category;
      accumulator[key] = [...(accumulator[key] ?? []), decision];
      return accumulator;
    }, {})
  ).map(([category, items]) => ({
    category: category as keyof typeof CATEGORY_LABELS,
    metric: completionRate(items),
    count: items.length,
  }));

  return entries.sort((left, right) => right.metric - left.metric)[0];
}

function findBestFormat(decisions: DecisionRecord[]) {
  const short = decisions.filter((decision) => decision.selectedSuggestion.minutes <= 10);
  const medium = decisions.filter(
    (decision) =>
      decision.selectedSuggestion.minutes > 10 && decision.selectedSuggestion.minutes <= 20
  );
  const long = decisions.filter((decision) => decision.selectedSuggestion.minutes > 20);

  const ranked = [
    {
      key: 'short',
      title: 'Kisa ve tek adimli',
      body: '10 dakika alti, net bitisli kararlar sende daha cok tamamlaniyor.',
      metric: `${completionRate(short)}% tamamlandi`,
      score: completionRate(short),
    },
    {
      key: 'medium',
      title: 'Orta tempolu bloklar',
      body: '10-20 dakikalik kararlar sende en dengeli sonucu veriyor.',
      metric: `${completionRate(medium)}% tamamlandi`,
      score: completionRate(medium),
    },
    {
      key: 'long',
      title: 'Derin bloklar',
      body: '20+ dakikalik kararlar sende en tatmin edici ciktilari vermis.',
      metric: `${completionRate(long)}% tamamlandi`,
      score: completionRate(long),
    },
  ];

  return ranked.sort((left, right) => right.score - left.score)[0];
}

function buildFrictionBody(friction: Friction) {
  switch (friction) {
    case 'unclear':
      return 'Belirsizlikte senden daha cok calisan sey, daha kisa ve daha net tanimli adimlar.';
    case 'distracted':
      return 'Dikkat dagildiginda en iyi toparlayan format, tek hedefli ve kisa sprintler.';
    case 'tired':
      return 'Dusuk enerjide bedeni ya da sistemi resetleyen kararlar sende daha guvenli calisiyor.';
    case 'anxious':
      return 'Kaygida sonucu net olan, riski kucuk adimlar daha iyi isliyor.';
    case 'avoidant':
      return 'Kacinma halinde en iyi acilis, tek temas ya da tek mesaj gibi dusuk esikli adimlar.';
  }
}

function completionRate(decisions: DecisionRecord[]) {
  if (!decisions.length) {
    return 0;
  }

  const weighted = decisions.reduce((sum, decision) => {
    const resultBoost = decision.resultScore ? (decision.resultScore - 3) * 0.1 : 0;

    if (decision.completion === 'done') {
      return sum + Math.max(0, 1 + resultBoost);
    }

    if (decision.completion === 'partial') {
      return sum + Math.max(0, 0.55 + resultBoost);
    }

    return sum + Math.max(-0.2, resultBoost);
  }, 0);

  return Math.round((weighted / decisions.length) * 100);
}
