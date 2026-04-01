import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { UiCopy } from '../lib/uiCopy';
import { PlanTier, SupportedLanguage } from '../types';
import { theme } from '../theme';

interface SettingsScreenProps {
  copy: UiCopy;
  language: SupportedLanguage;
  plan: PlanTier;
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
  onOpenPaywall,
  onRestore,
  onManage,
  onLanguage,
  onGiftMove,
}: SettingsScreenProps) {
  const isTurkish = language === 'tr';
  const planLabel =
    plan === 'founding'
      ? isTurkish
        ? 'Kurucu'
        : 'Founding'
      : plan === 'pro-yearly'
        ? copy.paywall.annual
        : plan === 'pro-monthly'
          ? copy.paywall.monthly
          : copy.paywall.free;

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>{copy.settings.title}</Text>

      <Pressable onPress={onOpenPaywall} style={styles.heroRow}>
        <View style={styles.heroCopy}>
          <Text style={styles.heroLabel}>{copy.paywall.pro}</Text>
          <Text style={styles.heroTitle}>{copy.settings.upgrade}</Text>
          <Text style={styles.heroBody}>
            {isTurkish
              ? 'Daha net yön, daha güçlü toparlanma ve daha az sürtünme.'
              : 'Cleaner direction, stronger recovery, and less friction.'}
          </Text>
        </View>
        <Text style={styles.planPill}>{planLabel}</Text>
      </Pressable>

      <SettingsRow label={copy.settings.language} value={language.toUpperCase()} onPress={onLanguage} />
      <SettingsRow label={copy.settings.restore} value="App Store" onPress={onRestore} />
      <SettingsRow label={copy.settings.manage} value={planLabel} onPress={onManage} />
      <SettingsRow label={copy.settings.gift} value={isTurkish ? '1 açılım' : '1 unlock'} onPress={onGiftMove} />

      <View style={styles.infoBlock}>
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
    paddingBottom: 132,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.display,
    fontWeight: '900',
    letterSpacing: -1.1,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: theme.spacing.lg,
  },
  heroCopy: {
    flex: 1,
    gap: 6,
  },
  heroLabel: {
    color: theme.colors.accent,
    fontSize: theme.typography.meta,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  heroTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.h2,
    fontWeight: '800',
  },
  heroBody: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  planPill: {
    alignSelf: 'flex-start',
    color: theme.colors.text,
    fontSize: theme.typography.meta,
    fontWeight: '900',
    letterSpacing: 0.8,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  rowLabel: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  rowValue: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.body,
    fontWeight: '600',
  },
  infoBlock: {
    gap: theme.spacing.sm,
    paddingTop: 6,
  },
  infoLabel: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: '800',
  },
  infoBody: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
});
