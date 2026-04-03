import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { getUiCopy } from '../lib/uiCopy';
import { SupportedLanguage } from '../types';
import { theme } from '../theme';

interface RecoveryOverlayProps {
  visible: boolean;
  language: SupportedLanguage;
  source: 'abandon' | 'missed-day' | 'swap-fatigue';
  ctaLabel: string;
  onRecover: () => void;
}

export function RecoveryOverlay({
  visible,
  language,
  source,
  ctaLabel,
  onRecover,
}: RecoveryOverlayProps) {
  const recoveryCopy = getUiCopy(language).recovery;

  const body =
    source === 'swap-fatigue'
      ? recoveryCopy.swapFatigueBody
      : source === 'missed-day'
        ? recoveryCopy.missedDayBody
        : recoveryCopy.abandonBody;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.backdrop}>
        <View style={styles.content}>
          <View style={styles.copyBlock}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{recoveryCopy.badge}</Text>
            </View>
            <Text style={styles.title}>{recoveryCopy.title}</Text>
            <Text style={styles.subtitle}>{body}</Text>
          </View>

          <Pressable onPress={onRecover} style={styles.button}>
            <Text style={styles.buttonText}>{ctaLabel}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
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
    backgroundColor: theme.colors.whiteOverlay,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  badgeText: {
    color: theme.colors.textSoft,
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
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
    maxWidth: 300,
  },
  button: {
    width: '100%',
    minHeight: 56,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
});
