import { useCallback, useState } from 'react';
import {
  Platform, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { buildReport, buildReportText, type ReportData } from '../data/report';
import { getSavedCheckins } from '../data/live';
import { theme } from '../theme';
import { mission } from '../data/sample';
import { queueReport } from '../data/reports';
import { loadReadings } from '../data/storage';
import { latestDose } from '../data/liveTrends';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { TopStrip } from '../components/TopStrip';

function saveText(text: string) {
  if (Platform.OS === 'web') {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flight-surgeon-report.txt';
    a.click();
    URL.revokeObjectURL(url);
  } else {
    Share.share({ message: text });
  }
}

export default function Report() {
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');

  const [data, setData] = useState<ReportData | null>(null);

  useFocusEffect(
    useCallback(() => {
      // getSavedCheckins().then((list) => setData(buildReport(list)));
      Promise.all([getSavedCheckins(), loadReadings()]).then(([list, readings]) =>
        setData(buildReport(list, latestDose(readings))),
      );
    }, []),
  );

  async function queue() {
    try {
      if (!data) return;
      const waiting = await queueReport(buildReportText(data, note));
      setMessage(`Queued on this device. ${waiting} report${waiting === 1 ? '' : 's'} waiting to send.`);
    } catch {
      setMessage('Could not queue the report. Try again.');
    }
  }

  if (!data) return <SafeAreaView style={styles.screen} edges={['top']}><TopStrip /></SafeAreaView>;

  if (!data.hasData) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <TopStrip />
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.inner}>
            <Text style={styles.title}>Flight surgeon report</Text>
            <Card>
              <Text style={styles.body}>
                No check-ins saved yet. Complete a daily check-in and the report will be built from it.
              </Text>
            </Card>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const flags = (
    <Card style={styles.flags}>
      <Text style={styles.flagTitle}>Active flags</Text>
      {(data.flags.length ? data.flags : ['No active flags']).map((f) => (
        <Text key={f} style={styles.body}>• {f}</Text>
      ))}
    </Card>
  );

  const indicators = (
    <Card>
      <Text style={styles.label}>Indicator summary · last 7 days</Text>
      {data.rows.map((r) => (
        <View key={r.indicator} style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowName}>{r.indicator}</Text>
            <Text style={styles.rowDetail}>
              Today {r.today} · baseline {r.baseline} · {r.trend}
            </Text>
          </View>
          <StatusBadge status={r.status} />
        </View>
      ))}
    </Card>
  );

  const rest = (
    <View style={styles.stack}>
      <Card>
        <Text style={styles.label}>Symptoms reported</Text>
        <Text style={styles.body}>{data.symptoms}</Text>
      </Card>
      <Card>
        <Text style={styles.label}>Note to flight surgeon (optional)</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          multiline
          placeholder="Add a short note"
          placeholderTextColor={theme.colors.textMuted}
          accessibilityLabel="Note to flight surgeon"
          style={styles.input}
        />
        <Text style={styles.hint}>
          Only this short text summary is sent, not your full history, to save bandwidth.
        </Text>
      </Card>
      <Pressable onPress={queue} style={styles.primary}>
        <Text style={styles.primaryText}>Queue for next link</Text>
      </Pressable>
      <Pressable onPress={() => data && saveText(buildReportText(data, note))} style={styles.secondary}>
        <Text style={styles.secondaryText}>{Platform.OS === 'web' ? 'Save as text file' : 'Share as text'}</Text>
      </Pressable>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <TopStrip />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.inner}>
          <Text style={styles.kicker}>
            {mission.name} · Mission day {mission.day} · {data.count} check-in{data.count === 1 ? '' : 's'}
          </Text>
          <Text style={styles.title}>Flight surgeon report</Text>

          {wide ? (
            <View style={styles.wideRow}>
              <View style={styles.leftCol}>{indicators}</View>
              <View style={styles.rightCol}>
                {flags}
                {rest}
              </View>
            </View>
          ) : (
            <View style={styles.stack}>
              {flags}
              {indicators}
              {rest}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 20 },
  inner: { width: '100%', maxWidth: 1100, alignSelf: 'center', gap: 12 },
  kicker: { color: theme.colors.textMuted, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase' },
  title: { color: theme.colors.text, fontSize: 28, fontWeight: '700' },
  stack: { gap: 12 },
  wideRow: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  leftCol: { flex: 3 },
  rightCol: { flex: 2, gap: 12 },
  flags: { borderLeftWidth: 4, borderLeftColor: theme.colors.watch, gap: 6 },
  flagTitle: { color: theme.colors.watch, fontSize: 12, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  label: { color: theme.colors.textMuted, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 },
  body: { color: theme.colors.text, fontSize: 14, lineHeight: 20 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12,
    paddingVertical: 11, borderTopWidth: 1, borderTopColor: theme.colors.border,
  },
  rowText: { flex: 1, gap: 2 },
  rowName: { color: theme.colors.text, fontSize: 15 },
  rowDetail: { color: theme.colors.textMuted, fontSize: 12 },
  input: {
    minHeight: 80, color: theme.colors.text, fontSize: 14, textAlignVertical: 'top',
    borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius, padding: 10,
  },
  hint: { color: theme.colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: 8 },
  primary: { alignItems: 'center', paddingVertical: 15, borderRadius: theme.radius, backgroundColor: theme.colors.action },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  secondary: {
    alignItems: 'center', paddingVertical: 15, borderRadius: theme.radius,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  secondaryText: { color: theme.colors.text, fontSize: 15 },
  message: { color: theme.colors.nominal, fontSize: 13 },
});
