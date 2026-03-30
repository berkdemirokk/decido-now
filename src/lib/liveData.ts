import AsyncStorage from '@react-native-async-storage/async-storage';
import { DecisionRecord, SupportedLanguage } from '../types';

const CACHE_TTL_MS = 1000 * 60 * 60 * 6;
const STORAGE_PREFIX = 'decido.live.';

export interface FinanceSnapshot {
  usdTry: number | null;
  btcUsd: number | null;
  fetchedAt: string;
}

export interface LearnCard {
  title: string;
  body: string;
  sourceLabel: string;
  fetchedAt: string;
}

export interface CoachInsight {
  title: string;
  body: string;
  sourceLabel: string;
}

export interface LanguageCard {
  title: string;
  body: string;
  sourceLabel: string;
  fetchedAt: string;
}

export async function getFinanceSnapshot(): Promise<FinanceSnapshot> {
  const cacheKey = `${STORAGE_PREFIX}finance.v1`;
  const cached = await readCache<FinanceSnapshot>(cacheKey);

  if (cached) {
    return cached;
  }

  const [usdTry, btcUsd] = await Promise.all([fetchUsdTry(), fetchBtcUsd()]);
  const snapshot: FinanceSnapshot = {
    usdTry,
    btcUsd,
    fetchedAt: new Date().toISOString(),
  };

  await writeCache(cacheKey, snapshot);
  return snapshot;
}

export async function getLearnCard(language: SupportedLanguage): Promise<LearnCard> {
  const cacheKey = `${STORAGE_PREFIX}learn.${language}.v1`;
  const cached = await readCache<LearnCard>(cacheKey);

  if (cached) {
    return cached;
  }

  const topics = getTopics(language);
  const topic = topics[new Date().getDate() % topics.length];

  try {
    const response = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`
    );

    if (!response.ok) {
      throw new Error('summary request failed');
    }

    const payload = (await response.json()) as {
      title?: string;
      extract?: string;
    };

    const card: LearnCard = {
      title: payload.title ?? topic,
      body:
        payload.extract?.slice(0, 220) ??
        'One small learning move today can change your week.',
      sourceLabel: 'Wikipedia',
      fetchedAt: new Date().toISOString(),
    };

    await writeCache(cacheKey, card);
    return card;
  } catch {
    const fallback: LearnCard = {
      title: topic,
      body: buildFallbackLearnBody(language),
      sourceLabel: 'Decido',
      fetchedAt: new Date().toISOString(),
    };

    await writeCache(cacheKey, fallback);
    return fallback;
  }
}

export async function getCoachInsight(
  decisions: DecisionRecord[],
  language: SupportedLanguage
): Promise<CoachInsight> {
  const apiUrl = process.env.EXPO_PUBLIC_DECIDO_AI_PROXY_URL;

  if (apiUrl) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          decisions: decisions.slice(0, 20),
        }),
      });

      if (response.ok) {
        const payload = (await response.json()) as {
          title?: string;
          body?: string;
        };

        if (payload.title && payload.body) {
          return {
            title: payload.title,
            body: payload.body,
            sourceLabel: 'AI Coach',
          };
        }
      }
    } catch {
      // Fall through to local summary.
    }
  }

  return buildLocalCoachInsight(decisions, language);
}

export async function getLanguageCard(
  language: SupportedLanguage
): Promise<LanguageCard> {
  const cacheKey = `${STORAGE_PREFIX}language.${language}.v1`;
  const cached = await readCache<LanguageCard>(cacheKey);

  if (cached) {
    return cached;
  }

  const seed = language === 'tr' ? 'focus' : 'momentum';

  try {
    const response = await fetch(
      `https://api.datamuse.com/words?ml=${encodeURIComponent(seed)}&max=6`
    );

    if (!response.ok) {
      throw new Error('datamuse request failed');
    }

    const payload = (await response.json()) as Array<{ word?: string }>;
    const words = payload
      .map((item) => item.word)
      .filter((item): item is string => Boolean(item))
      .slice(0, 5);

    const card: LanguageCard = {
      title: language === 'tr' ? 'Dil mini turu' : 'Language mini drill',
      body:
        language === 'tr'
          ? `Bu kelimelerle bir mini tekrar yap: ${words.join(', ')}. Her biriyle kisa bir cumle kur.`
          : `Use these words for a fast language drill: ${words.join(', ')}. Build one short sentence for each.`,
      sourceLabel: 'Datamuse',
      fetchedAt: new Date().toISOString(),
    };

    await writeCache(cacheKey, card);
    return card;
  } catch {
    const fallback: LanguageCard = {
      title: language === 'tr' ? 'Dil mini turu' : 'Language mini drill',
      body:
        language === 'tr'
          ? 'Bugun 5 kelime sec, her biriyle bir cumle kur ve sesli tekrar et.'
          : 'Pick 5 words today, build one sentence for each, and repeat them out loud.',
      sourceLabel: 'Decido',
      fetchedAt: new Date().toISOString(),
    };

    await writeCache(cacheKey, fallback);
    return fallback;
  }
}

async function fetchUsdTry() {
  try {
    const response = await fetch(
      'https://api.frankfurter.dev/v1/latest?base=USD&symbols=TRY'
    );

    if (!response.ok) {
      throw new Error('fx request failed');
    }

    const payload = (await response.json()) as {
      rates?: { TRY?: number };
    };

    return payload.rates?.TRY ?? null;
  } catch {
    return null;
  }
}

async function fetchBtcUsd() {
  try {
    const headers: Record<string, string> = {};
    const demoKey = process.env.EXPO_PUBLIC_COINGECKO_DEMO_KEY;

    if (demoKey) {
      headers['x-cg-demo-api-key'] = demoKey;
    }

    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
      { headers }
    );

    if (!response.ok) {
      throw new Error('crypto request failed');
    }

    const payload = (await response.json()) as {
      bitcoin?: { usd?: number };
    };

    return payload.bitcoin?.usd ?? null;
  } catch {
    return null;
  }
}

function buildLocalCoachInsight(
  decisions: DecisionRecord[],
  language: SupportedLanguage
): CoachInsight {
  const reviewed = decisions.filter((decision) => decision.reviewedAt);

  if (!reviewed.length) {
    return language === 'tr'
      ? {
          title: 'Bugun tek temiz hamle ara',
          body: 'Senden istedigim sey buyuk bir plan degil. 10-15 dakikalik, sonucu gorunur tek bir adim sec.',
          sourceLabel: 'Decido Coach',
        }
      : {
          title: 'Look for one clean move today',
          body: 'You do not need a huge plan. Pick one visible step that fits into 10 to 15 minutes.',
          sourceLabel: 'Decido Coach',
        };
  }

  const top = reviewed
    .slice(0, 8)
    .map((decision) => ({
      score:
        (decision.completion === 'done' ? 1 : decision.completion === 'partial' ? 0.4 : -0.6) +
        ((decision.resultScore ?? 3) - 3) * 0.35,
      decision,
    }))
    .sort((left, right) => right.score - left.score)[0]?.decision;

  if (!top) {
    return buildLocalCoachInsight([], language);
  }

  const minutes = top.selectedSuggestion.minutes;

  return language === 'tr'
    ? {
        title: `Bugun ${minutes} dakikalik bir blok daha iyi duruyor`,
        body: `${top.context.goal} niyetiyle ve ${top.context.friction} hissindeyken kisa, net kararlar sende daha iyi calisiyor.`,
        sourceLabel: 'Decido Coach',
      }
    : {
        title: `A ${minutes}-minute block looks strongest today`,
        body: `When your goal is ${top.context.goal} and the blocker feels like ${top.context.friction}, short visible actions tend to work best for you.`,
        sourceLabel: 'Decido Coach',
      };
}

async function readCache<T>(key: string) {
  try {
    const raw = await AsyncStorage.getItem(key);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as { storedAt: number; value: T };

    if (Date.now() - parsed.storedAt > CACHE_TTL_MS) {
      return null;
    }

    return parsed.value;
  } catch {
    return null;
  }
}

async function writeCache<T>(key: string, value: T) {
  try {
    await AsyncStorage.setItem(
      key,
      JSON.stringify({
        storedAt: Date.now(),
        value,
      })
    );
  } catch {
    // Ignore cache failures; live data is non-critical.
  }
}

function getTopics(language: SupportedLanguage) {
  if (language === 'tr') {
    return [
      'Decision-making',
      'Neuroplasticity',
      'Second language acquisition',
      'Habit',
      'Attention',
      'Behavior change',
    ];
  }

  return [
    'Decision-making',
    'Second language acquisition',
    'Attention',
    'Behavior change',
    'Creative problem-solving',
    'Personal finance',
  ];
}

function buildFallbackLearnBody(language: SupportedLanguage) {
  return language === 'tr'
    ? 'Bugun tek bir kavram sec, onu kendi cumlenle yaz ve hayatta nerede kullanilacagini dusun.'
    : 'Pick one concept today, explain it in your own words, and think about where you would use it in real life.';
}
