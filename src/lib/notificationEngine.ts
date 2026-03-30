import * as Notifications from 'expo-notifications';

import { SupportedLanguage } from '../types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export interface RecallNotificationPayload {
  title: string;
  body: string;
  date: Date;
}

export interface StreakSaverNotificationPayload {
  title: string;
  body: string;
  date: Date;
}

export async function ensureNotificationPermission() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return 'granted' as const;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted ? ('granted' as const) : ('denied' as const);
}

export function buildRecallNotification(moveTitle: string, language: SupportedLanguage): RecallNotificationPayload {
  const date = new Date(Date.now() + 2 * 60 * 60 * 1000);

  if (language === 'tr') {
    return {
      title: 'Kisa geri donus',
      body: `"${moveTitle}" enerjini nasil etkiledi? Skorlamak icin ac.`,
      date,
    };
  }

  return {
    title: 'Quick recall',
    body: `How did "${moveTitle}" impact your energy? Open to score.`,
    date,
  };
}

export function buildStreakSaverNotification(language: SupportedLanguage): StreakSaverNotificationPayload {
  const date = getTonightSaverTime();

  if (language === 'tr') {
    return {
      title: 'Momentumunu koru',
      body: '2 dakikalik reset ile seriyi bugun koruyabilirsin.',
      date,
    };
  }

  return {
    title: 'Save your momentum',
    body: 'Protect your streak with a quick 2-minute reset move.',
    date,
  };
}

export async function scheduleLocalNotification(payload: RecallNotificationPayload | StreakSaverNotificationPayload) {
  try {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: payload.title,
        body: payload.body,
        sound: false,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: payload.date,
      },
    });
  } catch {
    return null;
  }
}

function getTonightSaverTime() {
  const now = new Date();
  const target = new Date(now);
  target.setHours(21, 30, 0, 0);

  if (target <= now) {
    target.setMinutes(now.getMinutes() + 15);
  }

  return target;
}
