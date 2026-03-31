import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../theme';

interface RewardOverlayProps {
  visible: boolean;
  xpGain: number;
  levelBefore: string;
  levelAfter: string;
  title: string;
  message: string;
  detail: string;
  buttonLabel: string;
  onContinue: () => void;
}

export function RewardOverlay({
  visible,
  xpGain,
  levelBefore,
  levelAfter,
  title,
  message,
  detail,
  buttonLabel,
  onContinue,
}: RewardOverlayProps) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onContinue}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>{title.toUpperCase()}</Text>
          <View style={styles.ringOuter}>
            <View style={styles.ringInner}>
              <Text style={styles.xpLabel}>XP +{xpGain}</Text>
            </View>
          </View>
          <Text style={styles.levelCaption}>
            {levelBefore === levelAfter ? levelBefore : `${levelBefore} → ${levelAfter}`}
          </Text>
          <Text style={styles.message}>{message}</Text>
          <Text style={styles.subline}>{detail}</Text>
          <Pressable onPress={onContinue} style={styles.button}>
            <Text style={styles.buttonText}>{buttonLabel}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    padding: theme.spacing.xl,
    alignItems: 'center',
    gap: theme.spacing.md,
    ...theme.shadow.gold,
  },
  eyebrow: {
    color: theme.colors.accent,
    fontSize: theme.typography.meta,
    fontWeight: '900',
    letterSpacing: 1.3,
  },
  ringOuter: {
    width: 176,
    height: 176,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212,162,76,0.28)',
    backgroundColor: 'rgba(212,162,76,0.08)',
  },
  ringInner: {
    width: 128,
    height: 128,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  xpLabel: {
    color: theme.colors.accent,
    fontSize: theme.typography.h1,
    fontWeight: '900',
  },
  levelCaption: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  message: {
    color: theme.colors.text,
    textAlign: 'center',
    fontSize: theme.typography.h2,
    lineHeight: 30,
    fontWeight: '700',
  },
  subline: {
    color: theme.colors.textMuted,
    textAlign: 'center',
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  button: {
    width: '100%',
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.accent,
    paddingVertical: 16,
    alignItems: 'center',
    ...theme.shadow.gold,
  },
  buttonText: {
    color: '#1b1202',
    fontSize: theme.typography.body,
    fontWeight: '900',
  },
});
