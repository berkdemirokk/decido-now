import { Category, DecisionContext, DecisionRecord, Friction, Goal, PersonaArchetype, Suggestion, SupportedLanguage } from '../types';
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
  strongCount: number;
  doneRate: number;
  averageScore: number;
  lastResult: DecisionRecord | null;
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
    whyFits: withPersonaPrefix(
      buildWhyFits(suggestion, context, language, history),
      personaProfile?.guidanceTone.whyPrefix
    ),
    whatYouGain: buildGain(suggestion, context, language, history),
    steps: applyActionTone(
      buildSteps(suggestion, context, language, history),
      personaProfile?.guidanceTone.actionPrefix
    ),
    tinyLesson: buildLesson(suggestion, context, language, history),
    expectedOutcome: buildExpectedOutcome(suggestion, context, language, history),
    continueTomorrow: withPersonaPrefix(
      buildTomorrowStep(suggestion, context, language, history),
      personaProfile?.guidanceTone.tomorrowPrefix
    ),
  };
}

function withPersonaPrefix(text: string, prefix?: string) {
  if (!prefix) return text;
  return `${prefix} ${text}`;
}

function applyActionTone(steps: string[], prefix?: string) {
  if (!prefix) return steps;
  if (!steps.length) return steps;
  return [prefix, ...steps];
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
  const done = similar.filter((decision) => decision.completion === 'done').length;
  const strong = similar.filter((decision) => (decision.resultScore ?? 0) >= 4).length;
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
    strongCount: strong,
    doneRate: similar.length ? done / similar.length : 0,
    averageScore,
    lastResult: similar[0] ?? null,
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
      return `${describeGoal(context.goal, 'tr')} odağında ${describeCategory(suggestion.category, 'tr')} hamleleri sende son ${history.similarCount} benzer denemede ortalama ${history.averageScore || 3.8}/5 verdi. Özellikle ${describeFriction(context.friction, 'tr')} anlarında ${suggestion.minutes} dakikalık görünür adımlar daha temiz başlangıç çıkarıyor.`;
    }

    if (history.reviewedCount >= 3) {
      return `Sistemin gördüğü son hamlelere göre ${describeFriction(context.friction, 'tr')} halindeyken kısa ve görünür adımlar sende daha güvenli çalışıyor. Bu öneri ${describeGoal(context.goal, 'tr')} niyetini fazla sürtünme yaratmadan hareket ettirmek için seçildi.`;
    }

    return `${describeGoal(context.goal, 'tr')} odağında ve ${describeFriction(context.friction, 'tr')} halindeyken ${suggestion.minutes} dakikalık görünür bir adım sana fazla düşünmeden harekete geçme şansı verir.`;
  }

  if (history.similarCount >= 3) {
    return `Across your last ${history.similarCount} similar moves, ${describeCategory(suggestion.category, 'en')} actions have returned about ${history.averageScore || 3.8}/5 for you. In ${describeFriction(context.friction, 'en')} moments, visible ${suggestion.minutes}-minute moves are where you tend to restart faster.`;
  }

  if (history.reviewedCount >= 3) {
    return `Based on the moves you have already scored, short visible actions are a safer restart pattern for you when ${describeFriction(context.friction, 'en')}. This option was picked to move your ${describeGoal(context.goal, 'en')} goal without adding more drag.`;
  }

  return `With a ${describeGoal(context.goal, 'en')} goal and a ${describeFriction(context.friction, 'en')} blocker, a visible ${suggestion.minutes}-minute move gives you a cleaner way to start without overthinking.`;
}

function buildGain(
  suggestion: Suggestion,
  context: DecisionContext,
  language: SupportedLanguage,
  history: GuidanceHistory
) {
  const categoryGain =
    suggestion.category === 'learn'
      ? {
          tr: 'Dağınık bilgiyi somut öğrenmeye çevirir ve bir konuda net ilerleme hissi verir.',
          en: 'Turns scattered curiosity into concrete learning and gives you visible progress in one topic.',
        }
      : suggestion.category === 'language'
        ? {
            tr: 'Dil konusunda çekingenliği düşürür ve aktif kullanım kasını açar.',
            en: 'Reduces hesitation around language practice and gets you using it actively.',
          }
        : suggestion.category === 'earn' || suggestion.category === 'money'
          ? {
              tr: 'Gelir veya para tarafındaki soyut stresi görünür aksiyona çevirir.',
              en: 'Turns vague money stress into a visible action you can complete today.',
            }
          : suggestion.category === 'health'
            ? {
                tr: 'Enerjiyi toparlar ve sonraki kararların kalitesini yükseltebilir.',
                en: 'Can reset your energy and improve the quality of the decisions that follow.',
              }
            : suggestion.category === 'reset'
              ? {
                  tr: 'Zihinsel gürültüyü azaltır ve karar vermeyi kolaylaştırır.',
                  en: 'Lowers mental noise and makes the next decision easier to take.',
                }
              : suggestion.category === 'social'
                ? {
                    tr: 'Sosyal yükü azaltır ve bağ hissini güçlendirir.',
                    en: 'Reduces social drag and strengthens your sense of connection.',
                  }
                : {
                    tr: 'Kararsızlığı azaltır ve bugünün momentumunu daha hızlı açar.',
                    en: "Reduces hesitation and opens today's momentum faster.",
                  };

  if (history.similarCount >= 2) {
    if (language === 'tr') {
      return `${categoryGain.tr} Bu formatta şu ana kadar ${history.strongCount} güçlü dönüş gördün; yani bu yalnızca teorik olarak değil, pratikte de sende çalışmaya başlamış bir desen.`;
    }

    return `${categoryGain.en} You have already seen ${history.strongCount} strong outcomes in moves like this, so the value here is not just theoretical.`;
  }

  if (language === 'tr') {
    return `${categoryGain.tr} Bu hamle özellikle ${describeGoal(context.goal, 'tr')} tarafında bugüne bir sonuç hissi eklemek için iyi bir köprü görevi görür.`;
  }

  return `${categoryGain.en} This move is especially useful when you want your ${describeGoal(context.goal, 'en')} goal to feel real today instead of staying abstract.`;
}

function buildSteps(
  suggestion: Suggestion,
  context: DecisionContext,
  language: SupportedLanguage,
  history: GuidanceHistory
) {
  const opener =
    language === 'tr'
      ? getOpeningStepTr(context, history)
      : getOpeningStepEn(context, history);

  switch (suggestion.category) {
    case 'learn':
      return language === 'tr'
        ? [opener, '3 temel not çıkar.', 'Bitince bir cümleyle kendine anlat.']
        : [opener, 'Pull out 3 anchor notes.', 'Explain it back in one sentence.'];
    case 'language':
      return language === 'tr'
        ? [opener, '10 kelime ya da 1 mini diyalog seç.', 'Sesli tekrar edip kendi örneğini kur.']
        : [opener, 'Choose 10 words or one micro dialogue.', 'Repeat it out loud and build one example of your own.'];
    case 'earn':
      return language === 'tr'
        ? [opener, 'Tek teklif ya da hedef kişiyi seç.', 'Mesajı kısaltıp bugün gönder.']
        : [opener, 'Pick one offer or one target person.', 'Shorten the message and send it today.'];
    case 'money':
      return language === 'tr'
        ? [opener, 'Tek harcama alanını aç.', 'En büyük sızıntıyı bulup tek kural koy.']
        : [opener, 'Open one spending area.', 'Find the biggest leak and set one simple rule.'];
    case 'health':
      return language === 'tr'
        ? [opener, 'Alan aç ve hareketi başlat.', 'Bitince enerjini tek kelimeyle not et.']
        : [opener, 'Create space and start the movement.', 'Log your energy in one word when you finish.'];
    case 'reset':
      return language === 'tr'
        ? [opener, 'Gürültüyü tek yere boşalt.', 'Bugün kapatacağın bir alanı gerçekten kapat.']
        : [opener, 'Dump the noise into one place.', 'Fully close one area today.'];
    case 'social':
      return language === 'tr'
        ? [opener, 'Tek kişiyi seç.', 'Mesajı kısaltıp hemen gönder.']
        : [opener, 'Pick one person.', 'Shorten the message and send it now.'];
    default:
      return language === 'tr'
        ? [opener, 'Tek hedefi seç.', 'Süre boyunca sadece ona bak ve bitince sonucu kaydet.']
        : [opener, 'Pick one target.', 'Stay with it for the full timer and record the result when you finish.'];
  }
}

function buildLesson(
  suggestion: Suggestion,
  context: DecisionContext,
  language: SupportedLanguage,
  history: GuidanceHistory
) {
  const base =
    suggestion.category === 'learn'
      ? {
          tr: 'Bilgi en çok, öğrenilen şeyi kendi cümlenle yeniden kurduğunda kalıcı olur.',
          en: 'Learning sticks best when you rebuild the idea in your own words.',
        }
      : suggestion.category === 'language'
        ? {
            tr: 'Dil, izleyerek değil kullanarak ilerler. Kısa sesli tekrarlar çekingenliği düşürür.',
            en: 'Language grows through use, not passive exposure. Short spoken reps reduce hesitation.',
          }
        : suggestion.category === 'earn'
          ? {
              tr: 'Gelir tarafında en büyük eşik genelde kalite değil, ilk çıkıştır.',
              en: 'In earning moves, the biggest blocker is usually not quality but making the first reach-out.',
            }
          : suggestion.category === 'money'
            ? {
                tr: 'Para stresi en çok belirsizlikten beslenir; görünür tablo kontrol hissi yaratır.',
                en: 'Money stress feeds on vagueness; a visible picture creates a sense of control.',
              }
            : suggestion.category === 'health'
              ? {
                  tr: 'Bedensel enerji düzelince zihinsel karar kalitesi de yükselir.',
                  en: 'When physical energy improves, mental decision quality often improves too.',
                }
              : suggestion.category === 'reset'
                ? {
                    tr: 'Küçük görünür toparlama hareketleri, büyük motivasyon dalgasından daha güvenilir çalışır.',
                    en: 'Small visible reset moves are more reliable than waiting for a huge motivation wave.',
                  }
                : suggestion.category === 'social'
                  ? {
                      tr: 'Sosyal bağ kurmada en pahalı şey uzun beklemedir; kısa temas daha sürdürülebilirdir.',
                      en: 'In relationships, long delays cost more than short imperfect contact.',
                    }
                  : {
                      tr: 'Kısa, net ve görünür adımlar beynin erteleme direncini düşürür.',
                      en: 'Short, visible actions lower the brain resistance to starting.',
                    };

  if (history.similarCount >= 3 && context.friction === 'avoidant') {
    return language === 'tr'
      ? `${base.tr} Sende özellikle kaçınma anlarında, kaliteyi büyütmek yerine ilk teması açmak daha iyi sonuç veriyor.`
      : `${base.en} For you, especially in avoidance moments, opening contact beats trying to perfect the move first.`;
  }

  if (history.similarCount >= 3 && context.friction === 'tired') {
    return language === 'tr'
      ? `${base.tr} Düşük enerjide kısa ve tamamlanabilir formatlar sende daha kalıcı momentum bırakıyor.`
      : `${base.en} On low-energy days, short finishable formats are leaving a stronger trail of momentum for you.`;
  }

  return language === 'tr' ? base.tr : base.en;
}

function buildExpectedOutcome(
  suggestion: Suggestion,
  context: DecisionContext,
  language: SupportedLanguage,
  history: GuidanceHistory
) {
  if (language === 'tr') {
    if (history.similarCount >= 3) {
      return `Benzer hamlelerde tamamlama oranın yaklaşık %${Math.round(history.doneRate * 100)}. Bu turda beklenti, ${suggestion.minutes} dakika sonunda daha net bir durum ve kayda geçecek bir sonuç çıkarman.`;
    }

    return `${suggestion.minutes} dakika sonunda ${describeGoal(context.goal, 'tr')} tarafında daha net bir durum, daha düşük sürtünme ve skora çevrilebilir bir sonuç beklersin.`;
  }

  if (history.similarCount >= 3) {
    return `Your completion rate on similar moves is about ${Math.round(history.doneRate * 100)}%. The goal here is to leave this ${suggestion.minutes}-minute block with one visible outcome you can score.`;
  }

  return `At the end of ${suggestion.minutes} minutes, expect more clarity around your ${describeGoal(context.goal, 'en')} goal, lower friction, and one visible result you can score.`;
}

function buildTomorrowStep(
  suggestion: Suggestion,
  context: DecisionContext,
  language: SupportedLanguage,
  history: GuidanceHistory
) {
  const stretch = history.averageScore >= 4 ? 'deeper' : 'lighter';

  switch (suggestion.category) {
    case 'learn':
      return language === 'tr'
        ? stretch === 'deeper'
          ? 'Yarın aynı konudan tek bir alt başlığı derinleştir.'
          : 'Yarın bugünkü konuyu 5 dakikalık tekrar turuyla koru.'
        : stretch === 'deeper'
          ? 'Tomorrow, deepen one subtopic from this same learning area.'
          : 'Tomorrow, protect this topic with a 5-minute review lap.';
    case 'language':
      return language === 'tr'
        ? stretch === 'deeper'
          ? 'Yarın aynı kelime ya da kalıplarla kısa bir ses kaydı bırak.'
          : 'Yarın bugün kullandığın kelimelerle tek bir mini tekrar yap.'
        : stretch === 'deeper'
          ? 'Tomorrow, record a short voice note with the same words or pattern.'
          : 'Tomorrow, run one tiny repetition with the words you used today.';
    case 'earn':
      return language === 'tr'
        ? stretch === 'deeper'
          ? 'Yarın bugünkü çıkışı ikinci bir kişiye ya da teklife genişlet.'
          : 'Yarın aynı alan için daha kısa bir ikinci outreach dene.'
        : stretch === 'deeper'
          ? "Tomorrow, extend today's outreach to one more person or offer."
          : 'Tomorrow, try one shorter follow-up outreach in the same lane.';
    case 'health':
      return language === 'tr'
        ? stretch === 'deeper'
          ? 'Yarın aynı enerjide bu hareketi bir kademe büyüt.'
          : 'Yarın aynı hareketin daha kısa bir versiyonunu tekrar et.'
        : stretch === 'deeper'
          ? 'Tomorrow, grow this same movement one level.'
          : 'Tomorrow, repeat a shorter version of the same move.';
    case 'reset':
      return language === 'tr'
        ? stretch === 'deeper'
          ? 'Yarın bugün kapattığın alanın yanındaki tek bir şeyi daha sadeleştir.'
          : 'Yarın aynı alanı korumak için 3 dakikalık mini kapatma yap.'
        : stretch === 'deeper'
          ? 'Tomorrow, simplify one more thing next to the area you closed today.'
          : 'Tomorrow, protect this reset with a 3-minute mini close.';
    default:
      return language === 'tr'
        ? stretch === 'deeper'
          ? 'Yarın bunun bir kademe daha zor ama benzer versiyonunu dene.'
          : 'Yarın aynı yapının daha kısa ve temiz bir tekrarını yap.'
        : stretch === 'deeper'
          ? 'Tomorrow, try a slightly harder version of the same move.'
          : 'Tomorrow, repeat the same structure in a shorter cleaner version.';
  }
}

function getOpeningStepTr(context: DecisionContext, history: GuidanceHistory) {
  if (context.friction === 'unclear') {
    return history.lastResult
      ? 'Önce bitince nasıl görüneceğini tek cümleyle yaz.'
      : 'Önce bitince nasıl görüneceğini tek cümleyle netleştir.';
  }

  if (context.friction === 'distracted') {
    return 'Telefonu uzağa koy ve yalnızca bu hareket için tek pencere bırak.';
  }

  if (context.friction === 'tired') {
    return 'Zorlamadan başla; ilk 2 dakikayı yalnızca ritim kurmaya ayır.';
  }

  if (context.friction === 'anxious') {
    return 'Mükemmel versiyonu değil, gönderilebilir ilk versiyonu hedefle.';
  }

  return 'Kaçınmayı kırmak için ilk teması 60 saniye içinde aç.';
}

function getOpeningStepEn(context: DecisionContext, history: GuidanceHistory) {
  if (context.friction === 'unclear') {
    return history.lastResult
      ? 'Start by writing one sentence that defines what done looks like.'
      : 'Start by defining what done looks like in one sentence.';
  }

  if (context.friction === 'distracted') {
    return 'Put the phone away and leave only one surface open for this move.';
  }

  if (context.friction === 'tired') {
    return 'Do not force intensity; use the first 2 minutes just to catch rhythm.';
  }

  if (context.friction === 'anxious') {
    return 'Aim for the first sendable version, not the perfect one.';
  }

  return 'Break avoidance by opening contact in the first 60 seconds.';
}

function describeGoal(goal: Goal, language: 'tr' | 'en') {
  const labels: Record<Goal, { tr: string; en: string }> = {
    finish: { tr: 'bitirme', en: 'finish' },
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
    unclear: { tr: 'belirsizlik', en: 'unclear moments' },
    distracted: { tr: 'dikkat dağınıklığı', en: 'distracted moments' },
    tired: { tr: 'düşük enerji', en: 'low-energy moments' },
    anxious: { tr: 'kaygı', en: 'anxious moments' },
    avoidant: { tr: 'kaçınma', en: 'avoidance moments' },
  };
  return labels[friction][language];
}

function describeCategory(category: Category, language: 'tr' | 'en') {
  const labels: Record<Category, { tr: string; en: string }> = {
    focus: { tr: 'odak', en: 'focus' },
    health: { tr: 'beden', en: 'health' },
    money: { tr: 'para', en: 'money' },
    social: { tr: 'sosyal', en: 'social' },
    reset: { tr: 'reset', en: 'reset' },
    growth: { tr: 'gelişim', en: 'growth' },
    learn: { tr: 'öğrenme', en: 'learning' },
    language: { tr: 'dil', en: 'language' },
    earn: { tr: 'gelir', en: 'earning' },
  };
  return labels[category][language];
}
