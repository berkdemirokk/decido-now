import {
  Category,
  DecisionContext,
  DecisionRecord,
  Friction,
  Goal,
  GrowthDirectionId,
  Suggestion,
  SupportedLanguage,
  SystemId,
} from '../types';

export interface DirectionOption {
  id: GrowthDirectionId;
  label: string;
  shortLabel: string;
  accent: string;
  active: boolean;
  promise: string;
  systemId: SystemId;
}

export interface WeeklyBlueprint {
  eyebrow: string;
  title: string;
  summary: string;
  progressLine: string;
  whyToday: string;
}

export interface DirectionModel {
  active: DirectionOption;
  options: DirectionOption[];
  weeklyBlueprint: WeeklyBlueprint;
  context: DecisionContext;
}

type DirectionDefinition = {
  id: GrowthDirectionId;
  systemId: SystemId;
  accent: string;
  categories: Category[];
  label: Record<'tr' | 'en', string>;
  shortLabel: Record<'tr' | 'en', string>;
  promise: Record<'tr' | 'en', string>;
  blueprint: Record<'tr' | 'en', { title: string; summary: string; whyToday: string }>;
  context: DecisionContext;
};

const DIRECTION_DEFINITIONS: Record<GrowthDirectionId, DirectionDefinition> = {
  mind: {
    id: 'mind',
    systemId: 'learn',
    accent: '#54c083',
    categories: ['learn', 'language', 'growth', 'focus'],
    label: { tr: 'Zihin', en: 'Mind' },
    shortLabel: { tr: 'Zihin', en: 'Mind' },
    promise: {
      tr: 'Genel kültürünü, dilini ve düşünme kaliteni her gün biraz daha yukarı taşı.',
      en: 'Sharpen your learning, culture, and thinking quality one day at a time.',
    },
    blueprint: {
      tr: {
        title: 'Bu hafta zihni keskinleştir',
        summary: 'Kısa ama görünür öğrenme kapanışları biriktir. Yarın daha net düşünmek için bugün zihin yatırımını açık bırakma.',
        whyToday: 'Bugünkü hamle, yarının karar kalitesini güçlendirir.',
      },
      en: {
        title: 'Sharpen your mind this week',
        summary: 'Stack short visible learning closes. Today’s mental investment makes tomorrow cleaner.',
        whyToday: 'Today’s move upgrades tomorrow’s decisions.',
      },
    },
    context: {
      goal: 'learn',
      friction: 'unclear',
      mode: 'quick-win',
      energy: 'mid',
      minutes: 15,
      budget: 'free',
      category: 'learn',
    },
  },
  body: {
    id: 'body',
    systemId: 'move',
    accent: '#46b7ff',
    categories: ['health', 'reset'],
    label: { tr: 'Beden', en: 'Body' },
    shortLabel: { tr: 'Beden', en: 'Body' },
    promise: {
      tr: 'Kilo, enerji, spor ve uyku tarafını günlük küçük kapanışlarla toparla.',
      en: 'Rebuild your body, energy, and training rhythm with daily closes.',
    },
    blueprint: {
      tr: {
        title: 'Bu hafta bedeni toplama haftası',
        summary: 'Büyük dönüşüm değil, ritim kur. Hareket, enerji ve uyku zemini oturdukça geri kalanı hızlanır.',
        whyToday: 'Bugünkü hamle bedeni oyuna geri sokar.',
      },
      en: {
        title: 'This week is about body rhythm',
        summary: 'Forget perfect transformation. Build repeatable movement, energy, and recovery.',
        whyToday: 'Today’s move gets your body back in the game.',
      },
    },
    context: {
      goal: 'reset',
      friction: 'tired',
      mode: 'reset',
      energy: 'low',
      minutes: 10,
      budget: 'free',
      category: 'health',
    },
  },
  social: {
    id: 'social',
    systemId: 'decide',
    accent: '#ff8a57',
    categories: ['social', 'language', 'growth'],
    label: { tr: 'Sosyal', en: 'Social' },
    shortLabel: { tr: 'Sosyal', en: 'Social' },
    promise: {
      tr: 'Arkadaşlık, iletişim ve sosyal cesaret tarafında seni her gün biraz daha aç.',
      en: 'Build social courage, contact, and relationships one move at a time.',
    },
    blueprint: {
      tr: {
        title: 'Bu hafta sosyal cesaret biriktir',
        summary: 'Amaç herkesle iyi olmak değil. İletişimi açan küçük ama dürüst hamleler biriktirmek.',
        whyToday: 'Bugünkü hamle teması başlatır ya da sıcak tutar.',
      },
      en: {
        title: 'Build social courage this week',
        summary: 'Not more people. Cleaner contact. Small honest moves that keep social momentum alive.',
        whyToday: 'Today’s move opens or warms a real connection.',
      },
    },
    context: {
      goal: 'connect',
      friction: 'avoidant',
      mode: 'bold',
      energy: 'mid',
      minutes: 10,
      budget: 'free',
      category: 'social',
    },
  },
  money: {
    id: 'money',
    systemId: 'earn',
    accent: '#d6a94f',
    categories: ['earn', 'money', 'focus'],
    label: { tr: 'Gelir', en: 'Money' },
    shortLabel: { tr: 'Gelir', en: 'Money' },
    promise: {
      tr: 'Para ve iş tarafını belirsiz niyetlerden çıkarıp görünür hamlelere çevir.',
      en: 'Turn vague financial intent into visible money moves.',
    },
    blueprint: {
      tr: {
        title: 'Bu hafta gelir tarafını görünür yap',
        summary: 'Mesele daha çok düşünmek değil. Teklif, takip ve para hareketlerini daha görünür kılmak.',
        whyToday: 'Bugünkü hamle para tarafında bir kapı açar.',
      },
      en: {
        title: 'Make money moves visible this week',
        summary: 'Less vague planning. More outreach, follow-up, and visible financial action.',
        whyToday: 'Today’s move opens a money-side door.',
      },
    },
    context: {
      goal: 'earn',
      friction: 'avoidant',
      mode: 'bold',
      energy: 'mid',
      minutes: 15,
      budget: 'free',
      category: 'earn',
    },
  },
  reset: {
    id: 'reset',
    systemId: 'reset',
    accent: '#8a84ff',
    categories: ['reset', 'focus', 'health'],
    label: { tr: 'Denge', en: 'Reset' },
    shortLabel: { tr: 'Denge', en: 'Reset' },
    promise: {
      tr: 'Zihni topla, gürültüyü düşür ve tekrar net hareket edecek zemini kur.',
      en: 'Lower noise, regain clarity, and rebuild clean footing.',
    },
    blueprint: {
      tr: {
        title: 'Bu hafta zihni hafiflet',
        summary: 'Bazen büyüme daha çok yüklenmek değil, sürtünmeyi azaltmaktır. Bu rota seni tekrar netliğe sokar.',
        whyToday: 'Bugünkü hamle günü hafifletir ve yeniden giriş açar.',
      },
      en: {
        title: 'Lighten the mental load this week',
        summary: 'Sometimes growth is not adding pressure. It is removing noise so you can move again.',
        whyToday: 'Today’s move clears the path back into action.',
      },
    },
    context: {
      goal: 'reset',
      friction: 'anxious',
      mode: 'reset',
      energy: 'low',
      minutes: 5,
      budget: 'free',
      category: 'reset',
    },
  },
};

export function mapDirectionToSystem(directionId: GrowthDirectionId): SystemId {
  return DIRECTION_DEFINITIONS[directionId].systemId;
}

export function inferDirectionFromSystem(systemId: SystemId): GrowthDirectionId {
  switch (systemId) {
    case 'earn':
      return 'money';
    case 'move':
      return 'body';
    case 'reset':
      return 'reset';
    case 'decide':
      return 'mind';
    case 'learn':
    default:
      return 'mind';
  }
}

export function getDirectionDefinition(directionId: GrowthDirectionId) {
  return DIRECTION_DEFINITIONS[directionId];
}

export function buildDirectionContext(directionId: GrowthDirectionId): DecisionContext {
  return { ...DIRECTION_DEFINITIONS[directionId].context };
}

export function getDirectionCategories(directionId: GrowthDirectionId) {
  return DIRECTION_DEFINITIONS[directionId].categories;
}

export function prioritizeSuggestionsForDirection(
  suggestions: Suggestion[],
  directionId: GrowthDirectionId,
  decisions: DecisionRecord[]
) {
  const categories = getDirectionCategories(directionId);
  const recentDoneByCategory = decisions
    .filter((decision) => decision.completion === 'done')
    .slice(0, 12)
    .reduce<Record<string, number>>((accumulator, decision) => {
      const key = decision.selectedSuggestion.category;
      accumulator[key] = (accumulator[key] ?? 0) + 1;
      return accumulator;
    }, {});

  return [...suggestions].sort((left, right) => {
    const leftDirection = categories.includes(left.category) ? 1 : 0;
    const rightDirection = categories.includes(right.category) ? 1 : 0;
    if (leftDirection !== rightDirection) {
      return rightDirection - leftDirection;
    }

    const leftScore = recentDoneByCategory[left.category] ?? 0;
    const rightScore = recentDoneByCategory[right.category] ?? 0;
    if (leftScore !== rightScore) {
      return rightScore - leftScore;
    }

    return left.minutes - right.minutes;
  });
}

export function buildDirectionModel(
  directionId: GrowthDirectionId,
  decisions: DecisionRecord[],
  language: SupportedLanguage
): DirectionModel {
  const locale = language === 'tr' ? 'tr' : 'en';
  const definition = DIRECTION_DEFINITIONS[directionId];
  const weeklyDecisions = decisions
    .filter((decision) => definition.categories.includes(decision.selectedSuggestion.category))
    .slice(0, 7);
  const completed = weeklyDecisions.filter((decision) => decision.completion === 'done').length;
  const reviewed = weeklyDecisions.filter((decision) => decision.reviewedAt).length;

  return {
    active: {
      id: definition.id,
      label: definition.label[locale],
      shortLabel: definition.shortLabel[locale],
      accent: definition.accent,
      active: true,
      promise: definition.promise[locale],
      systemId: definition.systemId,
    },
    options: (Object.keys(DIRECTION_DEFINITIONS) as GrowthDirectionId[]).map((id) => {
      const item = DIRECTION_DEFINITIONS[id];
      return {
        id,
        label: item.label[locale],
        shortLabel: item.shortLabel[locale],
        accent: item.accent,
        active: id === directionId,
        promise: item.promise[locale],
        systemId: item.systemId,
      };
    }),
    weeklyBlueprint: {
      eyebrow: locale === 'tr' ? 'BU HAFTA' : 'THIS WEEK',
      title: definition.blueprint[locale].title,
      summary: definition.blueprint[locale].summary,
      progressLine:
        locale === 'tr'
          ? `${completed}/${Math.max(reviewed, 1)} temiz kapanış bu rotada birikti.`
          : `${completed}/${Math.max(reviewed, 1)} clean closes are already stacking in this lane.`,
      whyToday: definition.blueprint[locale].whyToday,
    },
    context: buildDirectionContext(directionId),
  };
}
