import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';
import { link } from '../data/sample';

export function TopStrip() {
  return (
    <View style={styles.bar}>
      <Text style={styles.text}>Link delayed {link.delayMinutes} min</Text>
      <Text style={styles.text}>{link.queued} queued · Low data</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: theme.colors.link,
    paddingVertical: 8,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  text: { color: '#FFFFFF', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' },
});