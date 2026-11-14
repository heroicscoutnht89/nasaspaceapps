import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';
import { loadDemoHistory, resetEverything, simulateSolarEvent } from '../data/demo';
import { Card } from './Card';

export function DemoTools({ onChange }: { onChange: () => void }) {
  const [message, setMessage] = useState('');
  const [confirming, setConfirming] = useState(false);

  if (process.env.EXPO_PUBLIC_DEMO !== '1') return null;

  async function run(fn: () => Promise<string>) {
    setMessage('Working...');
    try {
      setMessage(await fn());
    } catch {
      setMessage('Something went wrong.');
    }
    onChange();
  }

  function reset() {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 4000);
      return;
    }
    setConfirming(false);
    run(resetEverything);
  }

  return (
    <Card style={styles.card}>
      <Text style={styles.label}>Demo tools</Text>
      <View style={styles.row}>
        <Pressable onPress={() => run(loadDemoHistory)} style={styles.button} accessibilityRole="button">
          <Text style={styles.text}>Load demo history</Text>
        </Pressable>
        <Pressable onPress={() => run(simulateSolarEvent)} style={styles.button} accessibilityRole="button">
          <Text style={styles.text}>Simulate solar event</Text>
        </Pressable>
        <Pressable onPress={reset} style={styles.button} accessibilityRole="button">
          <Text style={styles.text}>{confirming ? 'Tap again to confirm' : 'Reset demo data'}</Text>
        </Pressable>
      </View>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 10, marginTop: 12 },
  label: { color: theme.colors.textMuted, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  button: {
    minHeight: 44, justifyContent: 'center', paddingHorizontal: 14,
    borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius,
  },
  text: { color: theme.colors.text, fontSize: 14 },
  message: { color: theme.colors.textMuted, fontSize: 13 },
});