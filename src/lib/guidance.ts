import {
  Category,
  DecisionContext,
  DecisionRecord,
  Friction,
  Goal,
  PersonaArchetype,
  Suggestion,
  SupportedLanguage,
} from '../types';
import { buildPersonaProfile } from './persona';

export interface GuidancePack {
  whyFits: string;
  whatYouGain: string;
  steps: string[];
  tinyLesson: string;
  expectedOutcome: string;
  continueTomorrow: string;
}

interface GuidanceHistory {
  reviewedCount: number;
  similarCount: number;
  doneRate: number;
  averageScore: number;
  abandonRate: number;
  swapHeavyCount: number;
}

export function buildGuidance(
  suggestion: Suggestion,
  context: DecisionContext,
  language: SupportedLanguage,
  decisions: DecisionRecord[],
  persona?: PersonaArchetype | null
): GuidancePack {
  const history = buildHistory(decisions, suggestion, context);
  const personaProfile = persona ? buildPersonaProfile(persona, language, context.goal) : null;

  return {
    whyFits: withPrefix(
      buildWhyFits(suggestion, context, language, history),
      personaProfile?.guidanceTone.whyPrefix
    ),
    whatYouGain: buildGain(suggestion, context, language, history),
    steps: applyActionPrefix(
      buildSteps(suggestion, context, language, history),
      personaProfile?.guidanceTone.actionPrefix
    ),
    tinyLesson: buildLesson(suggestion, context, language, history),
    expectedOutcome: buildExpectedOutcome(suggestion, context, language, history),
    continueTomorrow: withPrefix(
      buildTomorrow(suggestion, context, language, history),
      personaProfile?.guidanceTone.tomorrowPrefix
    ),
  };
}

function buildHistory(
  decisions: DecisionRecord[],
  suggestion: Suggestion,
  context: DecisionContext
): GuidanceHistory {
  const reviewed = decisions.filter((decision) => decision.reviewedAt);
  const similar = reviewed.filter((decision) => {
    const sameCategory = decision.selectedSuggestion.category === suggestion.category;
    const sameGoal = decision.context.goal === context.goal;
    const sameFriction = decision.context.friction === context.friction;
    const sameMode = decision.context.mode === context.mode;
    return sameCategory || (sameGoal && sameFriction) || (sameCategory && sameMode);
  });

  const doneCount = similar.filter((decision) => decision.completion === 'done').length;
  const abandonedCount = similar.filter(
    (decision) => decision.focusRunOutcome === 'abandoned'
  ).length;
  const swapHeavyCount = similar.filter(
    (decision) => (decision.swapCountBeforeSelection ?? 0) > 1
  ).length;
  const averageScore = similar.length
    ? Number(
        (
          similar.reduce((sum, decision) => sum + (decision.resultScore ?? 0), 0) / similar.length
        ).toFixed(1)
      )
    : 0;

  return {
    reviewedCount: reviewed.length,
    similarCount: similar.length,
    doneRate: similar.length ? doneCount / similar.length : 0,
    averageScore,
    abandonRate: similar.length ? abandonedCount / similar.length : 0,
    swapHeavyCount,
  };
}

function buildWhyFits(
  suggestion: Suggestion,
  context: DecisionContext,
  language: SupportedLanguage,
  history: GuidanceHistory
) {
  if (language === 'tr') {
    if (history.similarCount >= 3) {
      return `${describeGoal(context.goal, 'tr')} tarafinda benzer ${history.similarCount} hamle goruldu. Bu tip hamleler sende ortalama ${history.averageScore || 3.6}/5 veriyor ve ${Math.round(history.doneRate * 100)}% daha temiz kapanis uretiyor.`;
    }

    if (history.reviewedCount >= 3) {
      return `${describeFriction(context.friction, 'tr')} anlarinda kisa ve gorunur hamleler sende daha guvenli calisiyor. Bu secim bugunu acmak icin en dusuk surtunmeli yol.`;
    }

    return `${describeGoal(context.goal, 'tr')} odaginda ve ${describeFriction(context.friction, 'tr')} halinde, ${suggestion.minutes} dakikalik net bir hamle seni fazla dusunmeden harekete sokar.`;
  }

  if (history.similarCount >= 3) {
    return `You already have ${history.similarCount} similar moves on record. This format is returning about ${history.averageScore || 3.6}/5 and closing cleanly ${Math.round(history.doneRate * 100)}% of the time.`;
  }

  if (history.reviewedCount >= 3) {
    return `In ${describeFriction(context.friction, 'en')} moments, shorter visible moves are a safer start pattern for you. This is the lowest-drag move for today.`;
  }

  return `With a ${describeGoal(context.goal, 'en')} goal and a ${describeFriction(context.friction, 'en')} blocker, a ${suggestion.minutes}-minute visible move is the cleanest way to start.`;
}

function buildGain(
  suggestion: Suggestion,
  context: DecisionContext,
  language: SupportedLanguage,
  history: GuidanceHistory
) {
  const gain = getCategoryGain(suggestion.category, language);

  if (history.swapHeavyCount >= 2) {
    return language === 'tr'
      ? `${gain} Ayrica daha fazla secim degistirmeden tek yone girmene yardim eder.`
      : `${gain} It also helps you stop burning energy on extra switching.`;
  }

  if (history.abandonRate >= 0.35) {
    return language === 'tr'
      ? `${gain} Bu format, yari yolda biraktigin bloklara gore daha guvenli bir kapanis sansi verir.`
      : `${gain} Compared with the moves you tend to abandon, this format gives you a safer path to closure.`;
  }

  if (language === 'tr') {
    return `${gain} Bugunu acik niyetten gorunur sonuca cevirir.`;
  }

  return `${gain} It turns today from loose intent into something visible.`;
}

function buildSteps(
  suggestion: Suggestion,
  context: DecisionContext,
  language: SupportedLanguage,
  history: GuidanceHistory
) {
  const open = getOpeningStep(context, language, history);

  switch (suggestion.category) {
    case 'learn':
      return language === 'tr'
        ? [open, '3 ana not cikar.', 'Bitince tek cumleyle geri anlat.']
        : [open, 'Pull out 3 anchor notes.', 'Explain it back in one sentence.'];
    case 'language':
      return language === 'tr'
        ? [open, '10 kelime ya da 1 mini diyalog sec.', 'Sesli tekrar et ve tek bir ornek kur.']
        : [open, 'Choose 10 words or one micro dialogue.', 'Repeat it out loud and build one example.'];
    case 'earn':
      return language === 'tr'
        ? [open, 'Tek kisiyi ya da tek teklifi sec.', 'Mesaji kisalt ve bugun gonder.']
        : [open, 'Pick one person or one offer.', 'Shorten the message and send it today.'];
    case 'money':
      return language === 'tr'
        ? [open, 'Tek para akisini ac.', 'En buyuk sizintiyi bul ve tek kural koy.']
        : [open, 'Open one money area.', 'Find the biggest leak and set one rule.'];
    case 'health':
      return language === 'tr'
        ? [open, 'Alani ac ve hareketi baslat.', 'Bitince enerjini tek kelimeyle not et.']
        : [open, 'Create space and start the movement.', 'Log your energy in one word when you finish.'];
    case 'reset':
      return language === 'tr'
        ? [open, 'Gurultuyu tek yere bosalt.', 'Bugun kapanacak tek alani gercekten kapat.']
        : [open, 'Dump the noise into one place.', 'Fully close one area today.'];
    case 'social':
      return language === 'tr'
        ? [open, 'Tek kisiyi sec.', 'Mesaji kisalt ve gonder.']
        : [open, 'Pick one person.', 'Shorten the message and send it.'];
    default:
      return language === 'tr'
        ? [open, 'Tek hedefi sec.', 'Sure boyunca sadece ona bak ve sonucu kaydet.']
        : [open, 'Pick one target.', 'Stay with it and record the result when you finish.'];
  }
}

function buildLesson(
  suggestion: Suggestion,
  context: DecisionContext,
  language: SupportedLanguage,
  history: GuidanceHistory
) {
  const base = getCategoryLesson(suggestion.category, language);

  if (history.abandonRate >= 0.35) {
    return language === 'tr'
      ? `${base} Sende asil risk kalite degil, gec baslamak.`
      : `${base} Your bigger risk is not quality. It is starting too late.`;
  }

  if (context.friction === 'avoidant') {
    return language === 'tr'
      ? `${base} Kacindigin anlarda ilk temas, kusursuz planlamadan daha fazla is cikariyor.`
      : `${base} In avoidance moments, first contact beats perfect planning.`;
  }

  return base;
}

function buildExpectedOutcome(
  suggestion: Suggestion,
  context: DecisionContext,
  language: SupportedLanguage,
  history: GuidanceHistory
) {
  if (language === 'tr') {
    if (history.similarCount >= 3) {
      return `Hedef: ${suggestion.minutes} dakika sonunda kayda gececek tek bir sonuc almak. Benzer hamlelerde kapanis oranin yaklasik %${Math.round(history.doneRate * 100)}.`;
    }

    return `Hedef: ${suggestion.minutes} dakika sonunda gorunur tek bir sonuc almak ve surtunmeyi dusurmek.`;
  }

  if (history.similarCount >= 3) {
    return `Goal: leave this ${suggestion.minutes}-minute block with one visible result you can score. Similar moves are closing about ${Math.round(history.doneRate * 100)}% of the time.`;
  }

  return `Goal: leave this ${suggestion.minutes}-minute block with one visible result and lower drag for the next move.`;
}

function buildTomorrow(
  suggestion: Suggestion,
  context: DecisionContext,
  language: SupportedLanguage,
  history: GuidanceHistory
) {
  const deeper = history.averageScore >= 4 && history.doneRate >= 0.6;

  switch (suggestion.category) {
    case 'learn':
      return language === 'tr'
        ? deeper
          ? 'Yarin ayni konunun tek alt basligina in.'
          : 'Yarin 5 dakikalik bir tekrar turu ac.'
        : deeper
          ? 'Tomorrow, go one layer deeper on the same topic.'
          : 'Tomorrow, open a 5-minute review lap.';
    case 'language':
      return language === 'tr'
        ? deeper
          ? 'Yarin ayni kalipla sesli mini tekrar yap.'
          : 'Yarin bugunku kelimelerle tek mini tur daha don.'
        : deeper
          ? 'Tomorrow, do one spoken mini repeat with the same pattern.'
          : "Tomorrow, run one more tiny lap with today's words.";
    case 'earn':
      return language === 'tr'
        ? deeper
          ? 'Yarin bugunku cikisi ikinci kisiye ac.'
          : 'Yarin ayni alanda daha kisa bir follow-up gonder.'
        : deeper
          ? "Tomorrow, extend today's reach to one more person."
          : 'Tomorrow, send one shorter follow-up in the same lane.';
    case 'reset':
      return language === 'tr'
        ? deeper
          ? 'Yarin ayni alanin yaninda tek bir seyi daha sadelestir.'
          : 'Yarin bu reseti 3 dakikalik mini kapama ile koru.'
        : deeper
          ? 'Tomorrow, simplify one more thing next to the area you closed.'
          : 'Tomorrow, protect this reset with a 3-minute mini close.';
    default:
      return language === 'tr'
        ? deeper
          ? 'Yarin ayni yapinin bir kademe daha zorunu dene.'
          : 'Yarin ayni yapinin daha kisa bir tekrarini yap.'
        : deeper
          ? 'Tomorrow, try a slightly harder version of the same structure.'
          : 'Tomorrow, repeat the same structure in a shorter version.';
  }
}

function getOpeningStep(
  context: DecisionContext,
  language: SupportedLanguage,
  history: GuidanceHistory
) {
  if (context.friction === 'unclear') {
    return language === 'tr'
      ? history.reviewedCount > 0
        ? 'Bitince nasil gorunecegini tek cumleyle yaz.'
        : 'Once bitmis halini tek cumleyle netlestir.'
      : history.reviewedCount > 0
        ? 'Write one sentence that defines done.'
        : 'Define the finished state in one sentence.';
  }

  if (context.friction === 'distracted') {
    return language === 'tr'
      ? 'Tek bir ekran birak. Digerini kapa.'
      : 'Leave one screen open. Close the rest.';
  }

  if (context.friction === 'tired') {
    return language === 'tr'
      ? 'Gucu zorlamadan basla. Ilk 2 dakika sadece ritim kur.'
      : 'Start without forcing intensity. Use the first 2 minutes to catch rhythm.';
  }

  if (context.friction === 'anxious') {
    return language === 'tr'
      ? 'Mukemmel olani degil, gonderilebilir ilk versiyonu hedefle.'
      : 'Do not aim for perfect. Aim for sendable.';
  }

  return language === 'tr'
    ? 'Kacinmayi kirmak icin ilk temasi 60 saniyede ac.'
    : 'Break avoidance by opening contact inside 60 seconds.';
}

function getCategoryGain(category: Category, language: SupportedLanguage) {
  const copy = {
    learn: {
      tr: 'Daginik bilgiyi somut ogrenmeye cevirir.',
      en: 'Turns scattered curiosity into concrete learning.',
    },
    language: {
      tr: 'Dil cekingenligini indirip aktif kullanim kasini acar.',
      en: 'Reduces language hesitation and opens active use.',
    },
    earn: {
      tr: 'Soyut gelir stresini bugunluk gorunur aksiyona cevirir.',
      en: 'Turns vague money pressure into visible action.',
    },
    money: {
      tr: 'Para tarafindaki belirsizligi gorunur hale getirir.',
      en: 'Makes money friction visible and manageable.',
    },
    health: {
      tr: 'Enerjiyi toplar ve sonraki kararlari kolaylastirir.',
      en: 'Resets energy and makes later decisions easier.',
    },
    reset: {
      tr: 'Zihinsel gurultuyu indirir ve secim kalitesini toparlar.',
      en: 'Lowers mental noise and restores selection quality.',
    },
    social: {
      tr: 'Sosyal surtunmeyi indirip bag kurmayi kolaylastirir.',
      en: 'Cuts social friction and makes connection easier.',
    },
    focus: {
      tr: 'Kararsizligi kirip bugune gorunur bir sonuc ekler.',
      en: 'Breaks hesitation and adds one visible result to the day.',
    },
    growth: {
      tr: 'Belirsiz gelisimi bugunluk net bir adima indirir.',
      en: 'Turns vague growth into one clear move today.',
    },
  } satisfies Record<Category, { tr: string; en: string }>;

  return copy[category][language === 'tr' ? 'tr' : 'en'];
}

function getCategoryLesson(category: Category, language: SupportedLanguage) {
  const copy = {
    learn: {
      tr: 'Bilgi en cok kendi cumlenle geri kurdugunda kalir.',
      en: 'Learning sticks when you rebuild it in your own words.',
    },
    language: {
      tr: 'Dil izleyerek degil, kullanarak acilir.',
      en: 'Language opens through use, not passive exposure.',
    },
    earn: {
      tr: 'Gelir tarafinda asil esik kalite degil, ilk cikistir.',
      en: 'In earning moves, the real barrier is not quality. It is first contact.',
    },
    money: {
      tr: 'Para stresi belirsizlikten beslenir. Gorunur tablo kontrol hissi verir.',
      en: 'Money stress feeds on vagueness. A visible picture creates control.',
    },
    health: {
      tr: 'Beden toparlaninca zihinsel karar kalitesi de yukselir.',
      en: 'When the body resets, decision quality usually rises too.',
    },
    reset: {
      tr: 'Kucuk gorunur resetler, buyuk motivasyon beklemekten daha guvenli calisir.',
      en: 'Small visible resets work better than waiting for a big burst of motivation.',
    },
    social: {
      tr: 'Sosyal alanda en pahali sey kusursuzluk degil, gec kalmaktir.',
      en: 'In relationships, delay costs more than imperfection.',
    },
    focus: {
      tr: 'Kisa ve gorunur adimlar beynin baslama direncini dusurur.',
      en: "Short visible actions lower the brain's resistance to starting.",
    },
    growth: {
      tr: 'Buyuk hedefler, tek hamleye indiklerinde kapanmaya baslar.',
      en: 'Big goals start moving when they collapse into one move.',
    },
  } satisfies Record<Category, { tr: string; en: string }>;

  return copy[category][language === 'tr' ? 'tr' : 'en'];
}

function withPrefix(text: string, prefix?: string) {
  return prefix ? `${prefix} ${text}` : text;
}

function applyActionPrefix(steps: string[], prefix?: string) {
  if (!prefix || !steps.length) return steps;
  return [prefix, ...steps];
}

function describeGoal(goal: Goal, language: 'tr' | 'en') {
  const labels: Record<Goal, { tr: string; en: string }> = {
    finish: { tr: 'bitirme', en: 'finish' },
    learn: { tr: 'ogrenme', en: 'learning' },
    earn: { tr: 'gelir', en: 'earning' },
    reset: { tr: 'toparlanma', en: 'reset' },
    connect: { tr: 'bag kurma', en: 'connection' },
    build: { tr: 'uretim', en: 'building' },
  };

  return labels[goal][language];
}

function describeFriction(friction: Friction, language: 'tr' | 'en') {
  const labels: Record<Friction, { tr: string; en: string }> = {
    unclear: { tr: 'belirsizlik', en: 'unclear friction' },
    distracted: { tr: 'daginiklik', en: 'distraction' },
    tired: { tr: 'dusuk enerji', en: 'low energy' },
    anxious: { tr: 'kaygi', en: 'anxiety' },
    avoidant: { tr: 'kacinma', en: 'avoidance' },
  };

  return labels[friction][language];
}

