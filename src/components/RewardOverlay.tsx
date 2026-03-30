import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../theme';

interface RewardOverlayProps {
  visible: boolean;
  xpGain: number;
  levelBefore: string;
  levelAfter: string;
  message: string;
  buttonLabel: string;
  onContinue: () => void;
}

export function RewardOverlay({
  visible,
  xpGain,
  levelBefore,
  levelAfter,
  message,
  buttonLabel,
  onContinue,
}: RewardOverlayProps) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onContinue}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.xpBurst}>
            <Text style={styles.xpText}>XP +{xpGain}</Text>
          </View>
          <Text style={styles.levelText}>
            {levelBefore}
            {levelBefore !== levelAfter ? ` -> ${levelAfter}` : ''}
          </Text>
          <Text style={styles.message}>{message}</Text>
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
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    padding: theme.spacing.xl,
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  xpBurst: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.accentSoft,
  },
  xpText: {
    color: theme.colors.accent,
    fontSize: theme.typography.h1,
    fontWeight: '800',
  },
  levelText: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  message: {
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
  },
  buttonText: {
    color: '#1b1202',
    fontSize: theme.typography.body,
    fontWeight: '800',
  },
});
