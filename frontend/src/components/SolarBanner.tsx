import { useCallback, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { theme } from '../theme';
import { isSolarActive } from '../data/demo';
import { Card } from './Card';

export function SolarBanner() {
  const [active, setActive] = useState(false);
  useFocusEffect(
    useCallback(() => {
      isSolarActive().then(setActive);
    }, []),
  );
  if (!active) return null;
  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Solar particle event reported</Text>
      <Text style={styles.body}>
        Follow your mission's shelter procedure. Tell your flight surgeon right away about nausea,
        vomiting or unusual tiredness, and add a radiation reading when it is safe.
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { borderLeftWidth: 4, borderLeftColor: theme.colors.alert, gap: 4 },
  title: { color: theme.colors.alert, fontSize: 12, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  body: { color: theme.colors.text, fontSize: 14, lineHeight: 20 },
});