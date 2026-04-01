import * as Notifications from 'expo-notifications';

import { NotificationPermissionState, SupportedLanguage } from '../types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface RecallNotificationPayload {
  type: 'recall';
  title: string;
  body: string;
  date: Date;
  moveId: string;
}

export interface StreakSaverNotificationPayload {
  type: 'streak-saver';
  title: string;
  body: string;
  date: Date;
  dateKey: string;
}

export interface RecoveryNotificationPayload {
  type: 'recovery';
  title: string;
  body: string;
  date: Date;
  dateKey: string;
}

export type LocalNotificationPayload =
  | RecallNotificationPayload
  | RecoveryNotificationPayload
  | StreakSaverNotificationPayload;

export interface NotificationPermissionResult {
  permission: NotificationPermissionState;
  requested: boolean;
}

export async function ensureNotificationPermission(): Promise<NotificationPermissionResult> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return {
      permission: 'granted',
      requested: false,
    };
  }

  const requested = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: false,
    },
  });

  return {
    permission: requested.granted ? 'granted' : 'denied',
    requested: true,
  };
}

export function buildRecallNotification(
  moveId: string,
  moveTitle: string,
  language: SupportedLanguage
): RecallNotificationPayload {
  const date = new Date(Date.now() + 2 * 60 * 60 * 1000);

  if (language === 'tr') {
    return {
      type: 'recall',
      moveId,
      title: 'Hamle hâlâ sıcak',
      body: `"${moveTitle}" sende ne açtı? Gir ve skoru temiz kapat.`,
      date,
    };
  }

  return {
    type: 'recall',
    moveId,
    title: 'The move is still warm',
    body: `What did "${moveTitle}" unlock today? Jump back in and close the score cleanly.`,
    date,
  };
}

export function buildStreakSaverNotification(
  language: SupportedLanguage,
  dateKey: string
): StreakSaverNotificationPayload {
  const date = getTonightSaverTime();

  if (language === 'tr') {
    return {
      type: 'streak-saver',
      dateKey,
      title: 'Bugünü kaybetme',
      body: '2 dakikalık reset ile ritmi bugün içinde geri alabilirsin.',
      date,
    };
  }

  return {
    type: 'streak-saver',
    dateKey,
    title: 'Do not lose today',
    body: 'A 2-minute reset can still protect the day.',
    date,
  };
}

export function buildRecoveryNotification(
  language: SupportedLanguage,
  dateKey: string
): RecoveryNotificationPayload {
  const date = getRecoveryTime();

  if (language === 'tr') {
    return {
      type: 'recovery',
      dateKey,
      title: 'Momentum çatladı',
      body: '2 dakikalık kurtarma hamlesiyle tekrar harekete gir.',
      date,
    };
  }

  return {
    type: 'recovery',
    dateKey,
    title: 'Momentum cracked',
    body: 'Take the 2-minute recovery move and get back in motion.',
    date,
  };
}

export async function scheduleLocalNotification(payload: LocalNotificationPayload) {
  await cancelMatchingNotifications(payload);

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: payload.title,
      body: payload.body,
      sound: false,
      data:
        payload.type === 'recall'
          ? { type: payload.type, moveId: payload.moveId }
          : { type: payload.type, dateKey: payload.dateKey },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: payload.date,
    },
  });

  return identifier;
}

async function cancelMatchingNotifications(payload: LocalNotificationPayload) {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  const matches = scheduled.filter((item) => {
    const data = item.content.data as Record<string, string | undefined>;
    if (payload.type !== data.type) return false;

    if (payload.type === 'recall') {
      return data.moveId === payload.moveId;
    }

    return data.dateKey === payload.dateKey;
  });

  await Promise.all(matches.map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)));
}

function getTonightSaverTime() {
  const now = new Date();
  const target = new Date(now);
  target.setHours(20, 30, 0, 0);

  if (target <= now) {
    target.setMinutes(now.getMinutes() + 20);
  }

  return target;
}

function getRecoveryTime() {
  const now = new Date();
  const target = new Date(now);
  target.setMinutes(now.getMinutes() + 90, 0, 0);
  return target;
}
