import { StyleSheet, Text, View } from 'react-native';
import { Status, statusLabel, theme } from '../theme';

export function StatusBadge({ status }: { status: Status }) {
  const color = theme.colors[status];
  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color }]}>{statusLabel[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
});