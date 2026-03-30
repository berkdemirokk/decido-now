import { Suggestion, SupportedLanguage } from '../types';

export interface GiftMovePayload {
  code: string;
  moveId: string;
  moveTitle: string;
  moveAction: string;
  deepLink: string;
  shareMessage: string;
}

export interface ParsedGiftMoveLink {
  code: string;
  moveId: string;
  sender: string | null;
}

export function buildGiftMovePayload(
  move: Suggestion,
  language: SupportedLanguage,
  senderId = 'local-founder'
): GiftMovePayload {
  const code = `${move.id}-${Date.now().toString(36)}`;
  const deepLink = `decido://gift?code=${encodeURIComponent(code)}&move=${encodeURIComponent(move.id)}&sender=${encodeURIComponent(senderId)}`;

  if (language === 'tr') {
    return {
      code,
      moveId: move.id,
      moveTitle: move.title,
      moveAction: move.action,
      deepLink,
      shareMessage: `Sana Decido Now'dan ucretsiz bir Pro Move gonderdim: ${move.title}. Ac: ${deepLink}`,
    };
  }

  return {
    code,
    moveId: move.id,
    moveTitle: move.title,
    moveAction: move.action,
    deepLink,
    shareMessage: `I gifted you a free Pro Move from Decido Now: ${move.title}. Open it here: ${deepLink}`,
  };
}

export function canSendGift(sentCodes: string[]) {
  return sentCodes.length < 1;
}

export function parseGiftMoveLink(url: string): ParsedGiftMoveLink | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'decido:' || parsed.hostname !== 'gift') {
      return null;
    }

    const code = parsed.searchParams.get('code');
    const moveId = parsed.searchParams.get('move');
    const sender = parsed.searchParams.get('sender');

    if (!code || !moveId) {
      return null;
    }

    return {
      code,
      moveId,
      sender,
    };
  } catch {
    return null;
  }
}
