import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { getUiCopy } from '../lib/uiCopy';
import { SupportedLanguage } from '../types';
import { theme } from '../theme';

interface RewardOverlayProps {
  visible: boolean;
  language: SupportedLanguage;
  momentumLine?: string | null;
  xpGain: number;
  levelBefore: string;
  levelAfter: string;
  title: string;
  message: string;
  detail: string;
  outcomeLine?: string | null;
  cumulativeLine?: string | null;
  buttonLabel: string;
  onContinue: () => void;
}

export function RewardOverlay({
  visible,
  language,
  momentumLine,
  title,
  message,
  detail,
  outcomeLine,
  cumulativeLine,
  buttonLabel,
  onContinue,
}: RewardOverlayProps) {
  const rewardCopy = getUiCopy(language).reward;
  const continuationLine = buildContinuationLine(detail, language);

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onContinue}>
      <View style={styles.backdrop}>
        <View style={styles.content}>
          <View style={styles.copyBlock}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{rewardCopy.badge}</Text>
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{message}</Text>
            {momentumLine ? <Text style={styles.momentumLine}>{momentumLine}</Text> : null}
            {outcomeLine ? <Text style={styles.outcomeLine}>{outcomeLine}</Text> : null}
            {cumulativeLine ? (
              <Text style={styles.cumulativeLine}>{cumulativeLine}</Text>
            ) : null}
            {continuationLine ? <Text style={styles.detail}>{continuationLine}</Text> : null}
          </View>

          <Pressable onPress={onContinue} style={styles.button}>
            <Text style={styles.buttonText}>{buttonLabel}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function buildContinuationLine(detail: string, language: SupportedLanguage) {
  const cleaned = detail.trim();

  if (cleaned) {
    const firstChunk = cleaned.split(/[.!?]/)[0]?.trim() ?? cleaned;
    return firstChunk.length <= 46
      ? firstChunk
      : `${firstChunk.slice(0, 43).trimEnd()}...`;
  }

  return language === 'tr'
    ? 'Yarın bu çizginin üstüne çıkarsın'
    : 'Tomorrow, you continue this';
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  copyBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: theme.colors.accentSoft,
    borderWidth: 1,
    borderColor: theme.colors.accentGlow,
  },
  badgeText: {
    color: theme.colors.accent,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.3,
  },
  title: {
    color: theme.colors.text,
    fontSize: 42,
    lineHeight: 48,
    fontWeight: '800',
    fontFamily: 'Inter_700Bold',
    letterSpacing: -1.2,
    textAlign: 'center',
    maxWidth: 320,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
  momentumLine: {
    color: theme.colors.accent,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  outcomeLine: {
    color: theme.colors.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  cumulativeLine: {
    color: theme.colors.accent,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
  detail: {
    maxWidth: 320,
    color: theme.colors.textSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  button: {
    width: '100%',
    minHeight: 56,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
});
