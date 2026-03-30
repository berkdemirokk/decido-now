import { ScrollView, StyleSheet, Text } from 'react-native';

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

export function SystemsScreen({
  copy,
  cards,
  activeSystem,
  onSelect,
}: SystemsScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>{copy.tabs.systems}</Text>
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
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.display,
    fontWeight: '700',
  },
});
