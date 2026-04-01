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
      buildImpactLine(suggestion, context, language, history),
      personaProfile?.guidanceTone.whyPrefix
    ),
    whatYouGain: buildTodayImpact(suggestion, context, language, history),
    steps: applyActionPrefix(
      buildHowTo(suggestion, context, language, history),
      personaProfile?.guidanceTone.actionPrefix
    ),
    tinyLesson: buildResistanceNote(suggestion, context, language, history),
    expectedOutcome: buildCleanClose(suggestion, context, language, history),
    continueTomorrow: withPrefix(
      buildFutureProjectionLine(suggestion, context, language, history),
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
  const abandonedCount = similar.filter((decision) => decision.focusRunOutcome === 'abandoned').length;
  const swapHeavyCount = similar.filter((decision) => (decision.swapCountBeforeSelection ?? 0) > 1).length;
  const averageScore = similar.length
    ? Number((similar.reduce((sum, decision) => sum + (decision.resultScore ?? 0), 0) / similar.length).toFixed(1))
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

function buildImpactLine(
  suggestion: Suggestion,
  context: DecisionContext,
  language: SupportedLanguage,
  history: GuidanceHistory
) {
  if (language === 'tr') {
    if (history.similarCount >= 3) {
      return `Bu hamle senin ${describeGoal(
        context.goal,
        'tr'
      )} tarafındaki çalışma biçimine uyuyor. Benzer ${history.similarCount} blokta ortalama skorun ${
        history.averageScore || 3.8
      }/5 ve temiz kapanış oranın %${Math.round(history.doneRate * 100)}. Bugün en güvenli açılış burası.`;
    }

    if (history.reviewedCount >= 3) {
      return `Bugünün asıl sorunu ${describeFriction(
        context.friction,
        'tr'
      )} değil; orada fazla oyalanman. ${suggestion.minutes} dakikalık bu ${describeCategoryFrame(
        suggestion.category,
        'tr'
      )}, karar yükünü indirip seni doğrudan execution'a sokar.`;
    }

    return `${suggestion.minutes} dakikalık bu ${describeCategoryFrame(
      suggestion.category,
      'tr'
    )}, bugünü düşünceden çıkarıp harekete sokmanın en temiz yolu. Şu an ihtiyacın olan şey daha büyük plan değil; görünür ilk sonuç.`;
  }

  if (history.similarCount >= 3) {
    return `This move fits your ${describeGoal(
      context.goal,
      'en'
    )} pattern. Across ${history.similarCount} similar blocks, your average score is ${
      history.averageScore || 3.8
    }/5 and your clean-close rate is ${Math.round(history.doneRate * 100)}%. Today's safest opening starts here.`;
  }

  if (history.reviewedCount >= 3) {
    return `Today's real problem is not ${describeFriction(
      context.friction,
      'en'
    )}. It is staying there too long. This ${suggestion.minutes}-minute ${describeCategoryFrame(
      suggestion.category,
      'en'
    )} gets you back into execution fast.`;
  }

  return `This ${suggestion.minutes}-minute ${describeCategoryFrame(
    suggestion.category,
    'en'
  )} is the cleanest way to get out of your head and into motion today. You do not need a bigger plan. You need one visible result.`;
}

function buildTodayImpact(
  suggestion: Suggestion,
  _context: DecisionContext,
  language: SupportedLanguage,
  history: GuidanceHistory
) {
  const gain = getCategoryGain(suggestion.category, language);

  if (language === 'tr') {
    if (history.swapHeavyCount >= 2) {
      return `${gain} Aynı gün içinde fazla yön değiştirdiğinde enerji sızıyor. Bu hamle odağını tek çizgide sabitler.`;
    }

    if (history.abandonRate >= 0.35) {
      return `${gain} Ayrıca yarım bırakma riskini düşürür; çünkü senden kusursuzluk değil, kapanabilir bir blok ister.`;
    }

    return `${gain} Bugünün ağırlığını görünür sonuca çevirir.`;
  }

  if (history.swapHeavyCount >= 2) {
    return `${gain} Too much switching is leaking energy today. This move narrows everything into one line.`;
  }

  if (history.abandonRate >= 0.35) {
    return `${gain} It also lowers your abandon risk because it asks for a closeable block, not a perfect performance.`;
  }

  return `${gain} It turns today's pressure into something visible.`;
}

function buildHowTo(
  suggestion: Suggestion,
  context: DecisionContext,
  language: SupportedLanguage,
  history: GuidanceHistory
) {
  const open = getOpeningStep(context, language, history);

  switch (suggestion.category) {
    case 'learn':
      return language === 'tr'
        ? [open, 'Üç kilit not çıkar.', 'Sonunda tek cümleyle geri anlat.']
        : [open, 'Pull out three anchor notes.', 'Explain it back in one sentence at the end.'];
    case 'language':
      return language === 'tr'
        ? [open, 'Bugün kullanacağın tek kalıbı ya da 10 kelimeyi seç.', 'Sesli tekrar et ve bir örnek kur.']
        : [open, 'Choose one pattern or ten words you can use today.', 'Repeat it out loud and build one example.'];
    case 'earn':
      return language === 'tr'
        ? [open, 'Tek kişiyi, tek teklifi ya da tek çıkışı seç.', 'Mesajı kısalt ve bugün gönder.']
        : [open, 'Choose one person, one offer, or one outreach lane.', 'Shorten the message and send it today.'];
    case 'money':
      return language === 'tr'
        ? [open, 'Tek para alanını aç.', 'Sızıntıyı yakala ve tek kural koy.']
        : [open, 'Open one money area.', 'Catch the leak and set one rule.'];
    case 'health':
      return language === 'tr'
        ? [open, 'Bedenine alan aç ve ritmi başlat.', 'Bitince enerjini tek kelimeyle not et.']
        : [open, 'Create space for your body and start the rhythm.', 'Name your energy in one word when you finish.'];
    case 'reset':
      return language === 'tr'
        ? [open, 'Gürültüyü tek yere boşalt.', 'Bugün gerçekten kapanacak tek alanı kapat.']
        : [open, 'Dump the noise into one place.', 'Fully close the one area that needs to end today.'];
    case 'social':
      return language === 'tr'
        ? [open, 'Tek kişiyi seç.', 'Kısa, net ve gönderilebilir kal.']
        : [open, 'Pick one person.', 'Keep it short, clear, and sendable.'];
    default:
      return language === 'tr'
        ? [open, 'Tek hedef belirle.', 'Süre bitmeden görünür bir çıktı al.']
        : [open, 'Pick one target.', 'Leave the block with one visible output.'];
  }
}

function buildResistanceNote(
  suggestion: Suggestion,
  context: DecisionContext,
  language: SupportedLanguage,
  history: GuidanceHistory
) {
  const base = getCategoryLesson(suggestion.category, language);

  if (language === 'tr') {
    if (history.abandonRate >= 0.35) {
      return `${base} Sende asıl risk kötü iş çıkarmak değil; başlama eşiğini gereksiz büyütmek.`;
    }

    if (history.swapHeavyCount >= 2) {
      return `${base} Bir hamleyi daha değiştirmek netlik getirmeyecek. Netlik, içeride kalınca geliyor.`;
    }

    if (context.friction === 'avoidant') {
      return `${base} Kaçınma anında ilk temas, uzun hazırlıktan daha fazla iş çıkarır.`;
    }

    return `${base} Bugün kaliteyi değil, temiz kapanışı optimize et.`;
  }

  if (history.abandonRate >= 0.35) {
    return `${base} Your main risk is not doing poor work. It is making the start threshold too expensive.`;
  }

  if (history.swapHeavyCount >= 2) {
    return `${base} Another switch will not buy clarity. Clarity arrives when you stay inside the block.`;
  }

  if (context.friction === 'avoidant') {
    return `${base} In avoidance mode, first contact does more work than long preparation.`;
  }

  return `${base} Today, optimize for a clean close, not perfect quality.`;
}

function buildCleanClose(
  suggestion: Suggestion,
  context: DecisionContext,
  language: SupportedLanguage,
  history: GuidanceHistory
) {
  if (language === 'tr') {
    if (history.similarCount >= 3) {
      return `Bu blok bittiğinde kayda geçecek tek sonuç al. Benzer hamlelerde kapanış kaliten %${Math.round(
        history.doneRate * 100
      )} civarında. Bugün hedef gösteri değil; net bir kapanış izi.`;
    }

    return `${suggestion.minutes} dakika sonunda görünür tek bir sonuç bırak. ${describeGoal(
      context.goal,
      'tr'
    )} tarafındaki bugünün kazancı buradan yazılır.`;
  }

  if (history.similarCount >= 3) {
    return `Leave this block with one visible result worth scoring. Similar moves are closing cleanly about ${Math.round(
      history.doneRate * 100
    )}% of the time for you. Today is not about performing. It is about closing.`;
  }

  return `Leave this ${suggestion.minutes}-minute block with one visible result. That is where today's win gets written.`;
}

function buildFutureProjectionLine(
  suggestion: Suggestion,
  _context: DecisionContext,
  language: SupportedLanguage,
  history: GuidanceHistory
) {
  const deeper = history.averageScore >= 4 && history.doneRate >= 0.6;

  switch (suggestion.category) {
    case 'learn':
      return language === 'tr'
        ? deeper
          ? 'Bunu bugün kapatırsan yarın aynı konunun blueprint’i hazır kalır; sıfırdan açman gerekmez.'
          : 'Bunu bugün kapatırsan yarın 5 dakikalık kısa bir tekrar çok daha hafif gelir.'
        : deeper
          ? 'Close this today and tomorrow the same topic keeps a blueprint instead of forcing a fresh restart.'
          : 'Close this today and tomorrow a 5-minute review lap will feel much lighter.';
    case 'language':
      return language === 'tr'
        ? deeper
          ? 'Bunu bugün kapatırsan yarın aynı kalıpla konuşma prime’ını çok daha hızlı açarsın.'
          : 'Bunu bugün kapatırsan yarın bugünkü kelimelerle kısa bir tur daha dönmek kolaylaşır.'
        : deeper
          ? 'Close this today and tomorrow you can reopen your speaking prime with the same pattern much faster.'
          : "Close this today and tomorrow another quick lap with today's words gets easier.";
    case 'earn':
      return language === 'tr'
        ? deeper
          ? 'Bunu bugün kapatırsan yarın ikinci outreach ya da follow-up çok daha az dirençle açılır.'
          : 'Bunu bugün kapatırsan yarın para tarafında ikinci execution hamlesi daha kolay gelir.'
        : deeper
          ? 'Close this today and tomorrow the second outreach or follow-up opens with much less resistance.'
          : 'Close this today and tomorrow a second earning move will feel easier to execute.';
    case 'reset':
      return language === 'tr'
        ? deeper
          ? 'Bunu bugün kapatırsan yarın karar DNA’n daha temiz bir zeminde çalışır.'
          : 'Bunu bugün kapatırsan yarın kısa bir bakım hamlesiyle ritmi korumak kolaylaşır.'
        : deeper
          ? 'Close this today and tomorrow your decision DNA runs on cleaner ground.'
          : 'Close this today and tomorrow a short maintenance move will be easier to protect.';
    default:
      return language === 'tr'
        ? deeper
          ? 'Bunu bugün kapatırsan yarın aynı yapının daha güçlü versiyonuna rahat girersin.'
          : 'Bunu bugün kapatırsan yarın benzer hamleye daha az sürtünmeyle dönersin.'
        : deeper
          ? 'Close this today and tomorrow you can step into a stronger version of the same structure.'
          : 'Close this today and tomorrow the same type of move will feel easier to re-enter.';
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
        ? 'Bittiğinde ne göreceğini tek cümleyle yaz.'
        : 'Önce bitmiş hâli tek cümleyle netleştir.'
      : history.reviewedCount > 0
        ? 'Write one sentence that defines done.'
        : 'Define the finished state in one sentence first.';
  }

  if (context.friction === 'distracted') {
    return language === 'tr' ? 'Tek bir ekran bırak. Geri kalanını sustur.' : 'Leave one screen open and mute the rest.';
  }

  if (context.friction === 'tired') {
    return language === 'tr'
      ? 'İlk 2 dakikada hız değil ritim kur.'
      : 'Use the first 2 minutes to build rhythm, not intensity.';
  }

  if (context.friction === 'anxious') {
    return language === 'tr'
      ? 'Kusursuz olanı değil, gönderilebilir ilk versiyonu hedefle.'
      : 'Aim for the first sendable version, not the perfect one.';
  }

  return language === 'tr'
    ? 'Kaçınmayı kırmak için ilk teması 60 saniye içinde aç.'
    : 'Break avoidance by opening contact inside 60 seconds.';
}

function getCategoryGain(category: Category, language: SupportedLanguage) {
  const copy = {
    learn: {
      tr: 'Dağınık bilgiyi net bir öğrenme kazanımına çevirir.',
      en: 'Turns scattered input into a clear learning gain.',
    },
    language: {
      tr: 'Dil tarafındaki çekingenliği indirir ve kullanım kasını açar.',
      en: 'Lowers language hesitation and opens active use.',
    },
    earn: {
      tr: 'Belirsiz gelir stresini görünür execution’a çevirir.',
      en: 'Turns vague money pressure into visible execution.',
    },
    money: {
      tr: 'Para tarafındaki sis perdesini kaldırır ve kontrol hissi verir.',
      en: 'Clears the fog around money and restores control.',
    },
    health: {
      tr: 'Bedeni prime eder; sonra gelen kararlar daha temiz akar.',
      en: 'Primes the body so later decisions run cleaner.',
    },
    reset: {
      tr: 'Zihinsel gürültüyü düşürür ve karar kalitesini toparlar.',
      en: 'Lowers mental noise and restores decision quality.',
    },
    social: {
      tr: 'Sosyal sürtünmeyi indirir ve bağ kurmayı kolaylaştırır.',
      en: 'Cuts social friction and makes connection easier.',
    },
    focus: {
      tr: 'Kararsızlığı kırar ve bugüne görünür bir sonuç ekler.',
      en: 'Breaks hesitation and adds one visible result to the day.',
    },
    growth: {
      tr: 'Belirsiz gelişimi bugünün net hamlesine indirir.',
      en: 'Reduces vague growth into one clear move today.',
    },
  } satisfies Record<Category, { tr: string; en: string }>;

  return copy[category][language === 'tr' ? 'tr' : 'en'];
}

function getCategoryLesson(category: Category, language: SupportedLanguage) {
  const copy = {
    learn: {
      tr: 'Bilgi, kendi cümlenle geri kurulduğunda kalır.',
      en: 'Learning sticks when you rebuild it in your own words.',
    },
    language: {
      tr: 'Dil izleyerek değil, kullanarak açılır.',
      en: 'Language opens through use, not passive exposure.',
    },
    earn: {
      tr: 'Gelir tarafında asıl eşik kalite değil; ilk çıkıştır.',
      en: 'In earning moves, the real threshold is not quality. It is first contact.',
    },
    money: {
      tr: 'Para stresi belirsizlikten beslenir. Görünür tablo sistemi sakinleştirir.',
      en: 'Money stress feeds on vagueness. A visible picture settles the system.',
    },
    health: {
      tr: 'Beden toparlandığında karar kalitesi de yükselir.',
      en: 'When the body resets, decision quality usually rises too.',
    },
    reset: {
      tr: 'Kısa ve görünür resetler, büyük motivasyon beklemekten daha güvenlidir.',
      en: 'Small visible resets work better than waiting for a huge burst of motivation.',
    },
    social: {
      tr: 'Sosyal alanda en pahalı şey kusursuzluk değil; gecikmedir.',
      en: 'In connection moves, delay costs more than imperfection.',
    },
    focus: {
      tr: 'Kısa ve görünür bloklar beynin başlama direncini düşürür.',
      en: "Short visible blocks lower the brain's resistance to starting.",
    },
    growth: {
      tr: 'Büyük hedefler, tek hamleye indiğinde kapanmaya başlar.',
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
    finish: { tr: 'kapatma', en: 'closing' },
    learn: { tr: 'öğrenme', en: 'learning' },
    earn: { tr: 'gelir', en: 'earning' },
    reset: { tr: 'toparlanma', en: 'reset' },
    connect: { tr: 'bağ kurma', en: 'connection' },
    build: { tr: 'üretim', en: 'building' },
  };

  return labels[goal][language];
}

function describeFriction(friction: Friction, language: 'tr' | 'en') {
  const labels: Record<Friction, { tr: string; en: string }> = {
    unclear: { tr: 'belirsizlik', en: 'unclear friction' },
    distracted: { tr: 'dikkat dağınıklığı', en: 'distraction' },
    tired: { tr: 'düşük enerji', en: 'low energy' },
    anxious: { tr: 'kaygı', en: 'anxiety' },
    avoidant: { tr: 'kaçınma', en: 'avoidance' },
  };

  return labels[friction][language];
}

function describeCategoryFrame(category: Category, language: 'tr' | 'en') {
  const labels: Record<Category, { tr: string; en: string }> = {
    focus: { tr: 'focus hamlesi', en: 'focus move' },
    health: { tr: 'prime reset’i', en: 'prime reset' },
    money: { tr: 'para blueprint’i', en: 'money blueprint' },
    social: { tr: 'bağ kurma hamlesi', en: 'connection move' },
    reset: { tr: 'reset protokolü', en: 'reset protocol' },
    growth: { tr: 'gelişim blueprint’i', en: 'growth blueprint' },
    learn: { tr: 'öğrenme sprinti', en: 'learning sprint' },
    language: { tr: 'dil prime’ı', en: 'language prime' },
    earn: { tr: 'execution hamlesi', en: 'execution move' },
  };

  return labels[category][language];
}
