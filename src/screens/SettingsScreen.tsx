import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { WidgetPreview } from '../components/WidgetPreview';
import { UiCopy } from '../lib/uiCopy';
import { PlanTier, SupportedLanguage, SystemId } from '../types';
import { theme } from '../theme';

interface SettingsScreenProps {
  copy: UiCopy;
  language: SupportedLanguage;
  plan: PlanTier;
  currentSystem: SystemId;
  currentMoveTitle: string;
  onOpenPaywall: () => void;
  onRestore: () => void;
  onManage: () => void;
  onLanguage: () => void;
  onGiftMove: () => void;
}

export function SettingsScreen({
  copy,
  language,
  plan,
  currentSystem,
  currentMoveTitle,
  onOpenPaywall,
  onRestore,
  onManage,
  onLanguage,
  onGiftMove,
}: SettingsScreenProps) {
  const isTurkish = copy.tabs.today === 'Bugun';
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>{copy.settings.title}</Text>

      <Pressable onPress={onOpenPaywall} style={styles.primaryCard}>
        <Text style={styles.primaryTitle}>{copy.settings.upgrade}</Text>
        <Text style={styles.primaryBody}>
          {plan === 'founding'
            ? isTurkish
              ? 'Altin rozet aktif. Ozel DNA katmanlari ve erken erisim sistemleri acik.'
              : 'Gold badge live. Exclusive DNA layers and early-access systems are open.'
            : isTurkish
              ? 'Sinirsiz execution, daha guclu toparlanma ve daha derin okuma acilir.'
              : 'Unlock unlimited execution, stronger recovery, and deeper pattern reading.'}
        </Text>
      </Pressable>

      <View style={styles.widgetSection}>
        <Text style={styles.sectionLabel}>{copy.settings.widgets}</Text>
        <View style={styles.widgetRow}>
          <WidgetPreview
            size="small"
            systemId={currentSystem}
            moveTitle={currentMoveTitle}
            timeLeft="08:00"
            progress={0.58}
          />
          <WidgetPreview
            size="medium"
            systemId={currentSystem}
            moveTitle={currentMoveTitle}
            timeLeft="08:00 left"
            progress={0.58}
          />
        </View>
      </View>

      <SettingsRow label={copy.settings.gift} value={isTurkish ? '1 ucretsiz acilim' : '1 free unlock'} onPress={onGiftMove} />
      <SettingsRow label={copy.settings.restore} value="App Store" onPress={onRestore} />
      <SettingsRow label={copy.settings.manage} value={isTurkish ? 'Abonelik' : 'Subscription'} onPress={onManage} />
      <SettingsRow
        label={copy.settings.language}
        value={language.toUpperCase()}
        onPress={onLanguage}
      />

      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>{copy.settings.disclaimer}</Text>
        <Text style={styles.infoBody}>{copy.settings.safety}</Text>
      </View>
    </ScrollView>
  );
}

function SettingsRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
    paddingBottom: 140,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.display,
    fontWeight: '700',
  },
  primaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  primaryTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.h2,
    fontWeight: '700',
  },
  primaryBody: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  widgetSection: {
    gap: theme.spacing.sm,
  },
  sectionLabel: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.meta,
    fontWeight: '700',
    letterSpacing: 1,
  },
  widgetRow: {
    gap: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  rowLabel: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: '600',
  },
  rowValue: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
  },
  infoCard: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  infoLabel: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  infoBody: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
});
