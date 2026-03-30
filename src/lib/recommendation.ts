import { Category, DecisionContext, DecisionRecord, Friction, Goal } from '../types';

type RankedItem<T extends string> = { key: T; score: number };

const DEFAULT_RECOMMENDATION: RecommendationCard = {
  context: {
    goal: 'finish',
    friction: 'unclear',
    mode: 'quick-win',
    energy: 'mid',
    minutes: 10,
    budget: 'free',
    category: 'focus',
  },
  title: 'Bugun net bir kapatma hamlesi yap',
  body: 'Kisa sureli, odakli ve bitis cizgisi net bir gorevle baslamak senden daha cok aksiyon cikariyor.',
  todayGain: 'Bugun gorunur bir kapanis ve daha temiz bir odak kazanirsin.',
  tomorrowGain: 'Yarin daha az surtunmeyle ikinci hamleye girebilirsin.',
  shareLine: 'Today I picked one clear move and turned hesitation into action.',
};

export interface RecommendationCard {
  context: DecisionContext;
  title: string;
  body: string;
  todayGain: string;
  tomorrowGain: string;
  shareLine: string;
}

export interface ThreeDayPlan {
  title: string;
  body: string;
  metric: string;
}

export interface WeeklySummary {
  title: string;
  body: string;
  metric: string;
}

export interface WeeklyLifeReport {
  title: string;
  summary: string;
  wins: string[];
  risks: string[];
  nextFocus: string;
}

export interface ReturnLoopCard {
  title: string;
  body: string;
  metric: string;
}

export function buildTodayRecommendation(decisions: DecisionRecord[]): RecommendationCard {
  const reviewed = decisions.filter((decision) => decision.reviewedAt);

  if (reviewed.length < 3) {
    return DEFAULT_RECOMMENDATION;
  }

  const bestGoal = getTopScored(reviewed, (decision) => decision.context.goal);
  const bestCategory = getTopScored(reviewed, (decision) => decision.selectedSuggestion.category);
  const bestFriction = getTopScored(reviewed, (decision) => decision.context.friction);
  const bestMode = getTopScored(reviewed, (decision) => decision.context.mode);
  const bestEnergy = getTopScored(reviewed, (decision) => decision.context.energy);
  const bestMinutes = getBestMinutes(reviewed);

  const context: DecisionContext = {
    goal: bestGoal?.key ?? 'finish',
    friction: bestFriction?.key ?? 'unclear',
    category: bestCategory?.key ?? 'focus',
    mode: bestMode?.key ?? 'quick-win',
    energy: bestEnergy?.key ?? 'mid',
    minutes: bestMinutes,
    budget: 'free',
  };

  return {
    context,
    title: buildTitle(context.goal, (bestCategory?.key ?? 'focus') as Category),
    body: buildBody(context.goal, context.friction, bestMinutes),
    todayGain: buildTodayGain(context.goal, (bestCategory?.key ?? 'focus') as Category, bestMinutes),
    tomorrowGain: buildTomorrowGain(context.goal, (bestCategory?.key ?? 'focus') as Category),
    shareLine: buildShareLine(context.goal, (bestCategory?.key ?? 'focus') as Category),
  };
}

export function buildThreeDayPlan(decisions: DecisionRecord[]): ThreeDayPlan {
  const reviewed = decisions.filter((decision) => decision.reviewedAt);

  if (reviewed.length < 3) {
    return {
      title: '72 saatlik mikro hedefini ac',
      body: 'Onumuzdeki 3 gunde tek bir alan sec ve her gun gorunur tek adim at. Buyuk plan degil, arka arkaya 3 temiz hamle.',
      metric: '3 gun / 3 hamle',
    };
  }

  const strongestGoal = getTopScored(reviewed, (decision) => decision.context.goal)?.key ?? 'finish';
  const strongestCategory =
    getTopScored(reviewed, (decision) => decision.selectedSuggestion.category)?.key ?? 'focus';
  const lastThree = reviewed.slice(0, 3);
  const completionCount = lastThree.filter((decision) => decision.completion === 'done').length;

  return {
    title: `72 saatte ${describeGoal(strongestGoal)} odakli mini seri`,
    body: `Sende en cok calisan alan su an ${describeCategory(strongestCategory)}. Onumuzdeki 3 gunde bu alanda arka arkaya 3 kisa hamle yapmak momentumu buyutebilir.`,
    metric: `${completionCount}/3 son seri`,
  };
}

export function buildWeeklySummary(decisions: DecisionRecord[]): WeeklySummary {
  const recent = decisions
    .filter((decision) => decision.reviewedAt)
    .slice(0, 7);

  if (recent.length === 0) {
    return {
      title: 'Haftalik ritim daha yeni basliyor',
      body: 'Ilk birkac skordan sonra burada hangi alanlarda ivme kazandigin ve nerede surtundugun daha net gorunecek.',
      metric: '0 skorlanan karar',
    };
  }

  const doneCount = recent.filter((decision) => decision.completion === 'done').length;
  const averageScore = Math.round(
    (recent.reduce((sum, decision) => sum + (decision.resultScore ?? 0), 0) / recent.length) * 10
  ) / 10;
  const bestCategory =
    getTopScored(recent, (decision) => decision.selectedSuggestion.category)?.key ?? 'focus';

  return {
    title: `${describeCategory(bestCategory)} tarafinda haftalik momentum var`,
    body: `Son ${recent.length} skorlanan kararda ${doneCount} tanesini tam kapattin. Ortalama sonuc skorun ${averageScore}/5 ve en guclu alanin ${describeCategory(bestCategory)} olarak gorunuyor.`,
    metric: `${doneCount}/${recent.length} tamamlama`,
  };
}

export function buildWeeklyLifeReport(decisions: DecisionRecord[]): WeeklyLifeReport {
  const recent = decisions.filter((decision) => decision.reviewedAt).slice(0, 10);

  if (!recent.length) {
    return {
      title: 'Haftalik hayat raporu daha yeni basliyor',
      summary:
        'Birkaç skorlanan hamleden sonra burada seni ileri tasiyan alanlari, zorlandigin paternleri ve sonraki odak noktasini goreceksin.',
      wins: ['Ilk gorev: 3 hamleyi skorlama aliskanligi kur.'],
      risks: ['Sistem henuz seni taniyacak kadar veri gormedi.'],
      nextFocus: 'Bu hafta tek bir alanda ust uste temiz hamleler biriktir.',
    };
  }

  const bestCategory =
    getTopScored(recent, (decision) => decision.selectedSuggestion.category)?.key ?? 'focus';
  const bestGoal = getTopScored(recent, (decision) => decision.context.goal)?.key ?? 'finish';
  const frictionRisk = getLowestScored(recent, (decision) => decision.context.friction)?.key ?? 'unclear';
  const unfinished = recent.filter((decision) => decision.completion !== 'done').length;
  const avgScore =
    Math.round(
      (recent.reduce((sum, decision) => sum + (decision.resultScore ?? 0), 0) / recent.length) * 10
    ) / 10;

  return {
    title: `${describeCategory(bestCategory)} tarafinda hayat ritmi olusuyor`,
    summary: `Son ${recent.length} skorlanan hamlede ortalama sonuc puanin ${avgScore}/5. En cok guc aldigin yon ${describeCategory(bestCategory)}, en cok momentum ureten niyet ise ${describeGoal(bestGoal)} oldu.`,
    wins: [
      `${describeCategory(bestCategory)} kararlarinda tekrar eden bir guc var.`,
      `${describeGoal(bestGoal)} niyetli hamleler sende daha cok geri donus uretiyor.`,
      unfinished <= 2 ? 'Skorladigin hamlelerin cogu gorunur kapanisla bitiyor.' : 'Yarim kalanlari azaltirsan sistem daha da hizlanacak.',
    ],
    risks: [
      `${describeFriction(frictionRisk)} anlarinda sistemin daha kolay dagiliyor.`,
      unfinished > 2
        ? 'Son hamlelerde kapanis orani dusuyor; aksam check-in daha kritik hale geldi.'
        : 'Yeni patern olusuyor ama sureklilik icin aksam sonucu girmek gerekiyor.',
    ],
    nextFocus: `Bu hafta tek odagin su olsun: ${describeGoal(bestGoal)} tarafinda ${describeCategory(bestCategory)} alanini ust uste 3 hamle boyunca korumak.`,
  };
}

export function buildReturnLoopCard(decisions: DecisionRecord[]): ReturnLoopCard {
  const pending = decisions.filter((decision) => !decision.reviewedAt).length;

  if (pending > 0) {
    return {
      title: 'Tonight check-in',
      body: `Bugun baslattigin ${pending} hamle icin gece tek bir sonuc gir. Sistem asıl orada akillaniyor.`,
      metric: `${pending} bekleyen skor`,
    };
  }

  const recent = decisions.filter((decision) => decision.reviewedAt).slice(0, 3);
  const allStrong = recent.length > 0 && recent.every((decision) => (decision.resultScore ?? 0) >= 4);

  return {
    title: allStrong ? 'Tomorrow is ready' : 'Return tonight',
    body: allStrong
      ? 'Bugun guclu bir seri kurdun. Yarin sabah tek hamleyle devam etmen yeterli.'
      : 'Aksam bir hamleyi skorlamak, yarin gelecek onerinin kalitesini belirler.',
    metric: allStrong ? 'yarin sabah ac' : 'aksam 1 skor',
  };
}

function getTopScored<T extends string>(
  decisions: DecisionRecord[],
  pick: (decision: DecisionRecord) => T
): RankedItem<T> | undefined {
  const scores = decisions.reduce<Record<string, number>>((accumulator, decision) => {
    const key = pick(decision);
    accumulator[key] = (accumulator[key] ?? 0) + getContribution(decision);
    return accumulator;
  }, {});

  return Object.entries(scores)
    .map(([key, score]) => ({ key: key as T, score }))
    .sort((left, right) => right.score - left.score)[0];
}

function getLowestScored<T extends string>(
  decisions: DecisionRecord[],
  pick: (decision: DecisionRecord) => T
): RankedItem<T> | undefined {
  const scores = decisions.reduce<Record<string, number>>((accumulator, decision) => {
    const key = pick(decision);
    accumulator[key] = (accumulator[key] ?? 0) + getContribution(decision);
    return accumulator;
  }, {});

  return Object.entries(scores)
    .map(([key, score]) => ({ key: key as T, score }))
    .sort((left, right) => left.score - right.score)[0];
}

function getBestMinutes(decisions: DecisionRecord[]) {
  const buckets = decisions.reduce<Record<string, number>>((accumulator, decision) => {
    const bucket = decision.selectedSuggestion.minutes <= 10 ? 'short' : decision.selectedSuggestion.minutes <= 20 ? 'medium' : 'long';
    accumulator[bucket] = (accumulator[bucket] ?? 0) + getContribution(decision);
    return accumulator;
  }, {});

  const top = Object.entries(buckets).sort((left, right) => right[1] - left[1])[0]?.[0];

  if (top === 'long') {
    return 30;
  }

  if (top === 'medium') {
    return 15;
  }

  return 10;
}

function getContribution(decision: DecisionRecord) {
  const completion =
    decision.completion === 'done' ? 1 : decision.completion === 'partial' ? 0.35 : -0.6;
  const score = decision.resultScore ? (decision.resultScore - 3) * 0.45 : 0;
  return completion + score;
}

function buildTitle(goal: Goal, category: Category) {
  if (goal === 'learn' && category === 'language') {
    return 'Bugun dili kisa bir turla ilerlet';
  }

  if (goal === 'earn') {
    return 'Bugun gelir tarafinda tek net adim at';
  }

  if (goal === 'reset') {
    return 'Bugun sistemi once toparla';
  }

  if (goal === 'build') {
    return 'Bugun uretime gecmek icin kucuk bir blok ac';
  }

  return 'Bugun net bir hamleyle momentum ac';
}

function buildBody(goal: Goal, friction: Friction, minutes: number) {
  if (goal === 'earn') {
    return `${minutes} dakikalik, sonucu gorunur bir gelir hamlesi bugun senin icin en guvenli baslangic gibi duruyor.`;
  }

  if (goal === 'learn') {
    return `${minutes} dakikalik ogrenme sprintleri sende daha cok devam hissi uretiyor; ozellikle ${describeFriction(friction)} anlarinda iyi calisiyor.`;
  }

  return `${minutes} dakikalik temiz bir adim, ${describeFriction(friction)} anlarinda senden daha cok aksiyon cikariyor.`;
}

function buildTodayGain(goal: Goal, category: Category, minutes: number) {
  if (goal === 'earn' || category === 'earn' || category === 'money') {
    return `${minutes} dakika sonunda para ya da gelir tarafinda gorunur bir cikis noktan olur.`;
  }

  if (goal === 'learn' || category === 'learn' || category === 'language') {
    return `${minutes} dakika sonunda daginik bilgi yerine somut bir ogrenme kazanimi cikarmis olursun.`;
  }

  if (goal === 'reset' || category === 'health' || category === 'reset') {
    return `${minutes} dakika sonunda enerji ya da zihinsel gurultu tarafinda gorunur bir rahatlama beklenir.`;
  }

  if (category === 'social') {
    return `${minutes} dakika sonunda sosyal surtunmeyi azaltan gorunur bir temas acmis olursun.`;
  }

  return `${minutes} dakika sonunda bugun icin gorunur bir ilerleme ve daha temiz bir odak kazanirsin.`;
}

function buildTomorrowGain(goal: Goal, category: Category) {
  if (goal === 'earn' || category === 'earn' || category === 'money') {
    return 'Yarin ikinci bir outreach, teklif ya da para karari cok daha kolay acilir.';
  }

  if (goal === 'learn' || category === 'learn' || category === 'language') {
    return 'Yarin ayni konuyu surdurmek icin sifirdan baslamak zorunda kalmazsin.';
  }

  if (goal === 'reset' || category === 'health' || category === 'reset') {
    return 'Yarin karar kalitesi daha temiz bir enerji zemini ustunde calisir.';
  }

  if (category === 'social') {
    return 'Yarin takip mesajlari ya da yeni bag kurma adimlari daha dusuk direncle gelir.';
  }

  return 'Yarin bir sonraki hamleye daha az surtunmeyle gecersin.';
}

function buildShareLine(goal: Goal, category: Category) {
  if (goal === 'earn' || category === 'earn' || category === 'money') {
    return 'Today I picked one earning move and turned vague money stress into action.';
  }

  if (goal === 'learn' || category === 'learn' || category === 'language') {
    return 'Today I picked one learning move and turned scattered attention into progress.';
  }

  if (goal === 'reset' || category === 'health' || category === 'reset') {
    return 'Today I picked one reset move and cleared space for a better tomorrow.';
  }

  return 'Today I picked one smart move and stopped overthinking.';
}

function describeGoal(goal: Goal) {
  switch (goal) {
    case 'learn':
      return 'ogrenme';
    case 'earn':
      return 'gelir';
    case 'reset':
      return 'toparlanma';
    case 'connect':
      return 'bag kurma';
    case 'build':
      return 'uretim';
    default:
      return 'tamamlama';
  }
}

function describeCategory(category: Category) {
  switch (category) {
    case 'learn':
      return 'ogrenme';
    case 'language':
      return 'dil';
    case 'earn':
      return 'gelir';
    case 'money':
      return 'para';
    case 'health':
      return 'beden';
    case 'social':
      return 'sosyal';
    case 'reset':
      return 'reset';
    case 'growth':
      return 'gelisim';
    default:
      return 'odak';
  }
}

function describeFriction(friction: Friction) {
  switch (friction) {
    case 'unclear':
      return 'belirsizlik';
    case 'distracted':
      return 'dikkat daginikligi';
    case 'tired':
      return 'dusuk enerji';
    case 'anxious':
      return 'kaygi';
    case 'avoidant':
      return 'kacinma';
  }
}
