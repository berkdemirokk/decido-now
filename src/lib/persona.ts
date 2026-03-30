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
        title: isTr ? 'Mukemmeliyetci' : 'The Perfectionist',
        auditLine: isTr
          ? `${describeGoal(goal, true)} tarafinda kaliteyi buyutmek bazen hareketi geciktiriyor.`
          : `In ${describeGoal(goal, false)} moves, quality pressure is slowing your first step.`,
        guidanceTone: {
          whyPrefix: isTr
            ? 'Bunu dogru yapmak zorunda degilsin; gonderilebilir ilk versiyon yeterli.'
            : 'You do not need the perfect version; the first sendable version is enough.',
          actionPrefix: isTr
            ? 'Hamleyi hafiflet ve sadece ilk temiz cikisi hedefle.'
            : 'Keep the move light and aim for the first clean output.',
          tomorrowPrefix: isTr
            ? 'Yarin kaliteyi degil surekliligi buyut.'
            : 'Tomorrow, grow consistency before quality.',
        },
      };
    case 'the-chaotic-achiever':
      return {
        id,
        title: isTr ? 'Kaotik Basarici' : 'The Chaotic Achiever',
        auditLine: isTr
          ? `${describeGoal(goal, true)} niyetin guclu ama dağinik enerji temiz kapanislari bozuyor.`
          : `Your drive is strong, but scattered energy is hurting clean closes in ${describeGoal(goal, false)} moves.`,
        guidanceTone: {
          whyPrefix: isTr
            ? 'Hizin iyi; sistemi tek hedefe indirdiginde sonuca daha hizli ulasiyorsun.'
            : 'Your speed is useful; when the system narrows to one target, you close faster.',
          actionPrefix: isTr
            ? 'Sadece tek hedef acik kalsin; kalan her seyi sustur.'
            : 'Leave only one target open and mute the rest.',
          tomorrowPrefix: isTr
            ? 'Yarin ivmeni dagitmadan koru.'
            : 'Tomorrow, protect your momentum without scattering it.',
        },
      };
    default:
      return {
        id,
        title: isTr ? 'Tereddutlu Profesyonel' : 'The Hesitant Pro',
        auditLine: isTr
          ? `${describeGoal(goal, true)} tarafinda ne yapman gerektigini biliyorsun; esik sadece ilk cikis.`
          : `You already know what good looks like in ${describeGoal(goal, false)} moves; the main threshold is just the first send.`,
        guidanceTone: {
          whyPrefix: isTr
            ? 'Bu hamle karar kalitesini degil, ilk hareket cesaretini hedefliyor.'
            : 'This move is not testing your quality, it is opening your first motion.',
          actionPrefix: isTr
            ? 'Kisa, net ve yapilabilir kal.'
            : 'Keep it short, clear, and finishable.',
          tomorrowPrefix: isTr
            ? 'Yarin bu esik daha hafif hissedebilir.'
            : 'Tomorrow, this threshold should feel lighter.',
        },
      };
  }
}

function describeGoal(goal: Goal | undefined, tr: boolean) {
  const fallback = tr ? 'bugunun' : "today's";
  if (!goal) return fallback;

  const map: Record<Goal, { tr: string; en: string }> = {
    finish: { tr: 'bitirme', en: 'finishing' },
    learn: { tr: 'ogrenme', en: 'learning' },
    earn: { tr: 'gelir', en: 'earning' },
    reset: { tr: 'toparlanma', en: 'reset' },
    connect: { tr: 'bag kurma', en: 'connection' },
    build: { tr: 'uretim', en: 'building' },
  };

  return tr ? map[goal].tr : map[goal].en;
}
