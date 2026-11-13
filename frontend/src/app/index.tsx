import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { statusLabel, theme } from '../theme';
import { hazards, mission, overall } from '../data/sample';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { TopStrip } from '../components/TopStrip';
import { useRouter } from 'expo-router';

export default function Home() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <TopStrip />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.inner}>
          <Text style={styles.kicker}>
            {mission.name} · Mission day {mission.day} · {mission.phase}
          </Text>
          <Text style={styles.title}>Health status</Text>

          <Card style={styles.scoreCard}>
            <Text style={[styles.score, { color: theme.colors[overall.status] }]}>{overall.score}</Text>
            <View style={styles.scoreText}>
              <Text style={[styles.scoreLabel, { color: theme.colors[overall.status] }]}>
                {statusLabel[overall.status]}
              </Text>
              <Text style={styles.body}>{overall.message}</Text>
            </View>
          </Card>

          {/* Goes to the check-in screen in Step 2 */}
          <Pressable style={styles.button} onPress={() => router.navigate('/checkin')}>
            <Text style={styles.buttonText}>Start daily check-in</Text>
            <Text style={styles.buttonSub}>about 3 min</Text>
          </Pressable>
          {/* <Pressable style={styles.button} onPress={() => router.navigate('/checkin')}></Pressable> */}

          <Text style={styles.section}>Five spaceflight hazards</Text>
          {hazards.map((h) => (
            <View key={h.id} style={styles.hazardRow}>
              <View style={styles.hazardText}>
                <Text style={styles.hazardName}>{h.name}</Text>
                <Text style={styles.hazardDetail}>{h.detail}</Text>
              </View>
              <StatusBadge status={h.status} />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 20 },
  inner: { width: '100%', maxWidth: 1000, alignSelf: 'center', gap: 12 },
  kicker: { color: theme.colors.textMuted, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase' },
  title: { color: theme.colors.text, fontSize: 28, fontWeight: '700', marginBottom: 4 },
  scoreCard: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  score: { fontSize: 56, fontWeight: '700' },
  scoreText: { flex: 1, gap: 4 },
  scoreLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  body: { color: theme.colors.text, fontSize: 14, lineHeight: 20 },
  button: {
    backgroundColor: theme.colors.action,
    borderRadius: theme.radius,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  buttonSub: { color: '#FFFFFF', fontSize: 13 },
  section: {
    color: theme.colors.textMuted,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 12,
  },
  hazardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  hazardText: { flex: 1, gap: 2 },
  hazardName: { color: theme.colors.text, fontSize: 15 },
  hazardDetail: { color: theme.colors.textMuted, fontSize: 12 },
});