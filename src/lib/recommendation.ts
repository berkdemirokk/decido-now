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
  title: 'Bugün tek net execution hamlesini aç',
  body:
    'Kısa, kapanabilir ve çizgisi net bir blok; aşırı düşünmeyi susturup seni doğrudan harekete geçirir.',
  todayGain: 'Bugün görünür bir kapanış ve daha temiz bir odak zemini kazanırsın.',
  tomorrowGain: 'Yarın ikinci hamleye çok daha az sürtünmeyle girersin.',
  shareLine: 'Today I picked one clean move and turned hesitation into execution.',
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

  const category = (bestCategory?.key ?? 'focus') as Category;
  const context: DecisionContext = {
    goal: bestGoal?.key ?? 'finish',
    friction: bestFriction?.key ?? 'unclear',
    category,
    mode: bestMode?.key ?? 'quick-win',
    energy: bestEnergy?.key ?? 'mid',
    minutes: bestMinutes,
    budget: 'free',
  };

  return {
    context,
    title: buildTitle(context.goal, category),
    body: buildBody(context.goal, context.friction, category, bestMinutes),
    todayGain: buildTodayGain(context.goal, category, bestMinutes),
    tomorrowGain: buildTomorrowGain(context.goal, category),
    shareLine: buildShareLine(context.goal, category),
  };
}

export function buildThreeDayPlan(decisions: DecisionRecord[]): ThreeDayPlan {
  const reviewed = decisions.filter((decision) => decision.reviewedAt);

  if (reviewed.length < 3) {
    return {
      title: '72 saatlik momentum blueprint’ini aç',
      body:
        'Önündeki 3 günde tek alan seç. Her gün tek görünür kapanış al. Büyük plan değil; arka arkaya 3 temiz execution.',
      metric: '3 gün · 3 hamle',
    };
  }

  const strongestGoal = getTopScored(reviewed, (decision) => decision.context.goal)?.key ?? 'finish';
  const strongestCategory =
    getTopScored(reviewed, (decision) => decision.selectedSuggestion.category)?.key ?? 'focus';
  const lastThree = reviewed.slice(0, 3);
  const completionCount = lastThree.filter((decision) => decision.completion === 'done').length;

  return {
    title: `72 saatte ${describeGoal(strongestGoal)} tarafında seri kur`,
    body: `Sende en temiz çalışan alan şu an ${describeCategory(
      strongestCategory
    )}. Önündeki 3 günde bu şeritte art arda 3 kısa hamle, dağınık motivasyondan daha fazla momentum üretebilir.`,
    metric: `${completionCount}/3 son seri`,
  };
}

export function buildWeeklySummary(decisions: DecisionRecord[]): WeeklySummary {
  const recent = decisions.filter((decision) => decision.reviewedAt).slice(0, 7);

  if (recent.length === 0) {
    return {
      title: 'Haftalık ritim daha yeni kuruluyor',
      body: 'İlk birkaç skor geldikçe hangi hamle formatının sende gerçekten kapandığı daha net okunacak.',
      metric: '0 skorlanan hamle',
    };
  }

  const doneCount = recent.filter((decision) => decision.completion === 'done').length;
  const averageScore =
    Math.round((recent.reduce((sum, decision) => sum + (decision.resultScore ?? 0), 0) / recent.length) * 10) / 10;
  const bestCategory =
    getTopScored(recent, (decision) => decision.selectedSuggestion.category)?.key ?? 'focus';

  return {
    title: `${describeCategory(bestCategory)} tarafında haftalık momentum birikiyor`,
    body: `Son ${recent.length} skorlanan hamlede ${doneCount} temiz kapanış aldın. Ortalama skorun ${averageScore}/5 ve en güçlü şeridin şu an ${describeCategory(
      bestCategory
    )} olarak görünüyor.`,
    metric: `${doneCount}/${recent.length} kapanış`,
  };
}

export function buildWeeklyLifeReport(decisions: DecisionRecord[]): WeeklyLifeReport {
  const recent = decisions.filter((decision) => decision.reviewedAt).slice(0, 10);

  if (!recent.length) {
    return {
      title: 'Haftalık rapor daha yeni ısınıyor',
      summary:
        'Biraz daha skor biriktiğinde seni ileri taşıyan şeritleri, zayıf düşen anları ve sonraki odak alanını burada net görürsün.',
      wins: ['İlk iş: 3 hamleyi gerçekten skorlamak.'],
      risks: ['Sistem henüz seni keskin okuyacak kadar veri görmedi.'],
      nextFocus: 'Bu hafta tek alanda art arda temiz kapanış biriktir.',
    };
  }

  const bestCategory = getTopScored(recent, (decision) => decision.selectedSuggestion.category)?.key ?? 'focus';
  const bestGoal = getTopScored(recent, (decision) => decision.context.goal)?.key ?? 'finish';
  const frictionRisk = getLowestScored(recent, (decision) => decision.context.friction)?.key ?? 'unclear';
  const unfinished = recent.filter((decision) => decision.completion !== 'done').length;
  const avgScore =
    Math.round((recent.reduce((sum, decision) => sum + (decision.resultScore ?? 0), 0) / recent.length) * 10) / 10;

  return {
    title: `${describeCategory(bestCategory)} tarafında yeni bir ritim oluşuyor`,
    summary: `Son ${recent.length} skorlanan hamlede ortalama sonucun ${avgScore}/5. En güçlü yönün ${describeCategory(
      bestCategory
    )}, en çok momentum üreten niyetin ise ${describeGoal(bestGoal)} oldu.`,
    wins: [
      `${describeCategory(bestCategory)} hamlelerinde tekrar eden bir güç var.`,
      `${describeGoal(bestGoal)} niyeti sende daha fazla geri dönüş üretiyor.`,
      unfinished <= 2
        ? 'Skorladığın hamlelerin çoğu görünür kapanışla bitiyor.'
        : 'Yarım kalanları biraz daha düşürürsen sistem ciddi hız kazanır.',
    ],
    risks: [
      `${describeFriction(frictionRisk)} anlarında sistem daha kolay dağılıyor.`,
      unfinished > 2
        ? 'Son hamlelerde kapanış oranı düştü; akşam check-in bu yüzden daha kritik.'
        : 'Yeni patern oluşuyor ama ritmi korumak için akşam sonucu girmek şart.',
    ],
    nextFocus: `Bu hafta tek odağın şu olsun: ${describeGoal(bestGoal)} tarafında ${describeCategory(
      bestCategory
    )} şeridini art arda 3 hamle korumak.`,
  };
}

export function buildReturnLoopCard(decisions: DecisionRecord[]): ReturnLoopCard {
  const pending = decisions.filter((decision) => !decision.reviewedAt).length;

  if (pending > 0) {
    return {
      title: 'Bu akşam kilidi kapat',
      body: `Bugün başlattığın ${pending} hamle için gece tek bir sonuç gir. Sistem asıl keskinliğini orada kazanıyor.`,
      metric: `${pending} bekleyen skor`,
    };
  }

  const recent = decisions.filter((decision) => decision.reviewedAt).slice(0, 3);
  const allStrong = recent.length > 0 && recent.every((decision) => (decision.resultScore ?? 0) >= 4);

  return {
    title: allStrong ? 'Yarın hazır' : 'Bu akşam geri dön',
    body: allStrong
      ? 'Bugün temiz bir seri kurdun. Yarın sabah tek hamleyle yeniden açılman yeterli.'
      : 'Akşam girilen tek skor, yarın gelecek hamlenin kalitesini ciddi biçimde yükseltir.',
    metric: allStrong ? 'yarın sabah aç' : 'akşam 1 skor',
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
    const bucket =
      decision.selectedSuggestion.minutes <= 10 ? 'short' : decision.selectedSuggestion.minutes <= 20 ? 'medium' : 'long';
    accumulator[bucket] = (accumulator[bucket] ?? 0) + getContribution(decision);
    return accumulator;
  }, {});

  const top = Object.entries(buckets).sort((left, right) => right[1] - left[1])[0]?.[0];

  if (top === 'long') return 30;
  if (top === 'medium') return 15;
  return 10;
}

function getContribution(decision: DecisionRecord) {
  const completion = decision.completion === 'done' ? 1 : decision.completion === 'partial' ? 0.35 : -0.6;
  const score = decision.resultScore ? (decision.resultScore - 3) * 0.45 : 0;
  return completion + score;
}

function buildTitle(goal: Goal, category: Category) {
  if (goal === 'learn' && category === 'language') {
    return 'Bugün dil prime’ını aç';
  }

  if (goal === 'earn') {
    return 'Bugün tek gelir execution’ını aç';
  }

  if (goal === 'reset') {
    return 'Bugün önce sistemi temizle';
  }

  if (goal === 'build') {
    return 'Bugün üretim blueprint’ini başlat';
  }

  return 'Bugün tek net hamleyle momentumu aç';
}

function buildBody(goal: Goal, friction: Friction, category: Category, minutes: number) {
  if (goal === 'earn') {
    return `${minutes} dakikalık görünür bir gelir hamlesi, bugünün en temiz çıkışı gibi duruyor. Para tarafında fazla düşünmek yerine execution açman gerekiyor.`;
  }

  if (goal === 'learn') {
    return `${minutes} dakikalık bir öğrenme sprinti sende daha fazla devam hissi üretiyor. Özellikle ${describeFriction(
      friction
    )} anlarında bu format düşünceyi netliğe çeviriyor.`;
  }

  if (category === 'reset' || category === 'health') {
    return `${minutes} dakikalık kısa bir reset bloğu, bugünün sürtünmesini indirip karar DNA’nı tekrar prime eder.`;
  }

  return `${minutes} dakikalık temiz bir blok, ${describeFriction(
    friction
  )} anlarında senden daha çok aksiyon çıkarıyor. Bugün ihtiyacın olan şey tam olarak bu.`;
}

function buildTodayGain(goal: Goal, category: Category, minutes: number) {
  if (goal === 'earn' || category === 'earn' || category === 'money') {
    return `${minutes} dakika sonunda para ya da gelir tarafında görünür bir çıkış noktan olur.`;
  }

  if (goal === 'learn' || category === 'learn' || category === 'language') {
    return `${minutes} dakika sonunda dağınık bilgi yerine taşınabilir bir öğrenme kazanımı çıkarırsın.`;
  }

  if (goal === 'reset' || category === 'health' || category === 'reset') {
    return `${minutes} dakika sonunda enerji, beden ya da zihinsel gürültü tarafında görünür bir rahatlama açılır.`;
  }

  if (category === 'social') {
    return `${minutes} dakika sonunda sosyal sürtünmeyi azaltan görünür bir temas açmış olursun.`;
  }

  return `${minutes} dakika sonunda bugüne yazılmış görünür bir ilerleme ve daha temiz bir odak kazanırsın.`;
}

function buildTomorrowGain(goal: Goal, category: Category) {
  if (goal === 'earn' || category === 'earn' || category === 'money') {
    return 'Yarın ikinci outreach, teklif ya da para kararı çok daha hafif açılır.';
  }

  if (goal === 'learn' || category === 'learn' || category === 'language') {
    return 'Yarın aynı konuyu yeniden sıfırdan kurmak zorunda kalmazsın.';
  }

  if (goal === 'reset' || category === 'health' || category === 'reset') {
    return 'Yarın karar kalitesi daha temiz bir enerji zemini üstünde çalışır.';
  }

  if (category === 'social') {
    return 'Yarın yeni temas ya da takip mesajı çok daha düşük dirençle gelir.';
  }

  return 'Yarın bir sonraki hamleye daha az sürtünmeyle geçersin.';
}

function buildShareLine(goal: Goal, category: Category) {
  if (goal === 'earn' || category === 'earn' || category === 'money') {
    return 'Today I made one earning move and turned vague money pressure into execution.';
  }

  if (goal === 'learn' || category === 'learn' || category === 'language') {
    return 'Today I made one learning move and turned scattered attention into traction.';
  }

  if (goal === 'reset' || category === 'health' || category === 'reset') {
    return 'Today I made one reset move and gave tomorrow cleaner ground.';
  }

  return 'Today I made one smart move and stopped overthinking long enough to act.';
}

function describeGoal(goal: Goal) {
  switch (goal) {
    case 'learn':
      return 'öğrenme';
    case 'earn':
      return 'gelir';
    case 'reset':
      return 'toparlanma';
    case 'connect':
      return 'bağ kurma';
    case 'build':
      return 'üretim';
    default:
      return 'kapatma';
  }
}

function describeCategory(category: Category) {
  switch (category) {
    case 'learn':
      return 'öğrenme';
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
      return 'gelişim';
    default:
      return 'focus';
  }
}

function describeFriction(friction: Friction) {
  switch (friction) {
    case 'unclear':
      return 'belirsizlik';
    case 'distracted':
      return 'dikkat dağınıklığı';
    case 'tired':
      return 'düşük enerji';
    case 'anxious':
      return 'kaygı';
    case 'avoidant':
      return 'kaçınma';
  }
}
