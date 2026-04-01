import { Energy, Friction, Goal, PersonaArchetype, SupportedLanguage } from '../types';

export interface PersonaProfile {
  id: PersonaArchetype;
  title: string;
  auditLine: string;
  guidanceTone: {
    whyPrefix: string;
    actionPrefix: string;
    tomorrowPrefix: string;
  };
}

export function assignPersonaFromAudit(
  goal: Goal,
  friction: Friction,
  energy: Energy,
  minutes: number,
  language: SupportedLanguage
): PersonaProfile {
  let id: PersonaArchetype = 'the-hesitant-pro';

  if (friction === 'anxious' || minutes >= 20) {
    id = 'the-perfectionist';
  } else if (friction === 'distracted' || energy === 'high') {
    id = 'the-chaotic-achiever';
  }

  return buildPersonaProfile(id, language, goal);
}

export function buildPersonaProfile(
  id: PersonaArchetype,
  language: SupportedLanguage,
  goal?: Goal
): PersonaProfile {
  const isTr = language === 'tr';

  switch (id) {
    case 'the-perfectionist':
      return {
        id,
        title: isTr ? 'Mükemmeliyetçi' : 'The Perfectionist',
        auditLine: isTr
          ? `${describeGoal(goal, true)} tarafında kalite baskısı ilk hareketi geciktiriyor.`
          : `In ${describeGoal(goal, false)} moves, quality pressure is delaying your first move.`,
        guidanceTone: {
          whyPrefix: isTr
            ? 'Kusursuz versiyona ihtiyacın yok. Gönderilebilir ilk versiyon yeterli.'
            : 'You do not need the perfect version. The first sendable version is enough.',
          actionPrefix: isTr
            ? 'Hamleyi hafiflet. İlk temiz çıkışı hedefle.'
            : 'Lighten the move. Aim for the first clean output.',
          tomorrowPrefix: isTr
            ? 'Yarın kaliteyi değil, sürekliliği büyüt.'
            : 'Tomorrow, grow consistency before quality.',
        },
      };
    case 'the-chaotic-achiever':
      return {
        id,
        title: isTr ? 'Kaotik Başarıcı' : 'The Chaotic Achiever',
        auditLine: isTr
          ? `${describeGoal(goal, true)} niyetin güçlü ama dağınık enerji temiz kapanışları bozuyor.`
          : `Your drive is strong, but scattered energy is hurting clean closes in ${describeGoal(goal, false)} moves.`,
        guidanceTone: {
          whyPrefix: isTr
            ? 'Hızın değerli. Tek hedefe indiğinde sonuç çok daha hızlı geliyor.'
            : 'Your speed is useful. When you narrow to one target, results arrive faster.',
          actionPrefix: isTr
            ? 'Tek hedef kalsın. Geri kalan her şeyi sustur.'
            : 'Leave one target open. Mute the rest.',
          tomorrowPrefix: isTr
            ? 'Yarın ivmeni dağıtmadan koru.'
            : 'Tomorrow, protect your momentum without scattering it.',
        },
      };
    default:
      return {
        id,
        title: isTr ? 'Tereddütlü Profesyonel' : 'The Hesitant Pro',
        auditLine: isTr
          ? `${describeGoal(goal, true)} tarafında ne yapman gerektiğini biliyorsun. Asıl eşik ilk çıkış.`
          : `You already know what good looks like in ${describeGoal(goal, false)} moves. The real threshold is the first send.`,
        guidanceTone: {
          whyPrefix: isTr
            ? 'Bu hamle kalite testi değil; ilk hareketi açma hamlesi.'
            : 'This move is not a quality test. It is a first-motion move.',
          actionPrefix: isTr
            ? 'Kısa kal. Net kal. Kapanabilir kal.'
            : 'Keep it short. Keep it clear. Keep it closeable.',
          tomorrowPrefix: isTr
            ? 'Yarın bu eşik daha hafif hissedilecek.'
            : 'Tomorrow, this threshold should feel lighter.',
        },
      };
  }
}

function describeGoal(goal: Goal | undefined, tr: boolean) {
  const fallback = tr ? 'bugünün' : "today's";
  if (!goal) return fallback;

  const map: Record<Goal, { tr: string; en: string }> = {
    finish: { tr: 'kapatma', en: 'closing' },
    learn: { tr: 'öğrenme', en: 'learning' },
    earn: { tr: 'gelir', en: 'earning' },
    reset: { tr: 'toparlanma', en: 'reset' },
    connect: { tr: 'bağ kurma', en: 'connection' },
    build: { tr: 'üretim', en: 'building' },
  };

  return tr ? map[goal].tr : map[goal].en;
}
