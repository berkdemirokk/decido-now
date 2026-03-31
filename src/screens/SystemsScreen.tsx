import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { SystemCard } from '../components/SystemCard';
import { UiCopy } from '../lib/uiCopy';
import { TrackCard } from '../lib/trackEngine';
import { SystemId } from '../types';
import { theme } from '../theme';

interface SystemsScreenProps {
  copy: UiCopy;
  cards: TrackCard[];
  activeSystem: SystemId;
  onSelect: (systemId: SystemId) => void;
}

export function SystemsScreen({ copy, cards, activeSystem, onSelect }: SystemsScreenProps) {
  const isTurkish = copy.tabs.today === 'Bugun';
  const activeCard = cards.find((card) => card.id === activeSystem) ?? cards[0];

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>{isTurkish ? 'BUGUNUN SISTEMI' : 'TODAY\'S SYSTEM'}</Text>
        <Text style={styles.title}>{copy.tabs.systems}</Text>
        <Text style={styles.body}>
          {isTurkish
            ? 'Bugun hangi lane gunu tasiyacaksa onu sec. Sistem degistirmek yon degistirmek demektir.'
            : 'Choose the lane that should carry the day. Switching systems changes the direction of execution.'}
        </Text>
        {activeCard ? (
          <View style={styles.activeCard}>
            <Text style={styles.activeLabel}>{copy.states.activeToday}</Text>
            <Text style={styles.activeTitle}>{copy.systems[activeCard.id].title}</Text>
            <Text style={styles.activeBody}>{copy.systems[activeCard.id].promise}</Text>
          </View>
        ) : null}
      </View>

      {cards.map((card) => (
        <SystemCard
          key={card.id}
          title={copy.systems[card.id].title}
          promise={copy.systems[card.id].promise}
          metric={card.metric}
          body={card.body}
          accent={card.accent}
          activeLabel={card.id === activeSystem ? copy.states.activeToday : undefined}
          cta={copy.systems[card.id].cta}
          onPress={() => onSelect(card.id)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
    paddingBottom: 140,
  },
  hero: {
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    ...theme.shadow.gold,
  },
  eyebrow: {
    color: theme.colors.accent,
    fontSize: theme.typography.meta,
    fontWeight: '800',
    letterSpacing: 1.3,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.display,
    fontWeight: '700',
  },
  body: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  activeCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    gap: 6,
  },
  activeLabel: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.meta,
    fontWeight: '800',
    letterSpacing: 0.9,
  },
  activeTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.h2,
    fontWeight: '700',
  },
  activeBody: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
});
