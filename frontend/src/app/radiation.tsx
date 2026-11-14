import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { statusLabel, theme } from '../theme';
import { mission } from '../data/sample';
import {
  Reading, drillSteps, instrumentOptions, radiation, readings as sampleReadings, sensitiveAreas,
} from '../data/radiation';
import { loadReadings, saveReading } from '../data/storage';
import { Card } from '../components/Card';
import { Chips, TextField } from '../components/Inputs';
import { TopStrip } from '../components/TopStrip';

export default function Radiation() {
  const { width } = useWindowDimensions();
  const wide = width >= 900;

  const [readings, setReadings] = useState<Reading[]>(sampleReadings);
  const [drillOn, setDrillOn] = useState(false);
  const [logging, setLogging] = useState(false);
  const [dose, setDose] = useState('');
  const [instrument, setInstrument] = useState(instrumentOptions[0]);
  const [error, setError] = useState('');

  // Show readings saved on this device above the sample ones
  useEffect(() => {
    loadReadings()
      .then((saved) => setReadings([...saved.map((s) => s.reading).reverse(), ...sampleReadings]))
      .catch(() => {});
  }, []);

  const latest = readings[0];
  const pct = Math.min(100, (latest.dose / radiation.budget) * 100);
  const color = theme.colors[radiation.status];

  async function save() {
    const value = parseFloat(dose);
    if (isNaN(value) || value < latest.dose) {
      setError('Enter the total dose from your dosimeter. It cannot be lower than the last reading.');
      return;
    }
    const reading: Reading = {
      day: mission.day,
      dose: value,
      rate: Math.round((value - latest.dose) * 10) / 10,
      instrument,
    };
    try {
      await saveReading(reading);
      setReadings((prev) => [reading, ...prev]);
      setLogging(false);
      setDose('');
      setError('');
    } catch {
      setError('Could not save on this device. Try again.');
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <TopStrip />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.inner}>
          <Text style={styles.kicker}>
            {mission.name} · Mission day {mission.day} · {mission.phase} · Sample data
          </Text>
          <Text style={styles.title}>Radiation center</Text>

          {/* Top row: dose, rate, space weather */}
          <View style={[styles.row, wide && styles.rowWide]}>
            <Card style={[styles.doseCard, wide && { flex: 7 }]}>
              <View style={styles.head}>
                <Text style={styles.label}>Cumulative dose</Text>
                <Text style={[styles.badge, { color }]}>{statusLabel[radiation.status]}</Text>
              </View>
              <View style={styles.doseLine}>
                <Text style={styles.bigNumber}>{latest.dose}</Text>
                <Text style={styles.doseUnit}>mSv of {radiation.budget} sample budget</Text>
              </View>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
              </View>
              <View style={styles.scaleRow}>
                <Text style={styles.muted}>0</Text>
                <Text style={styles.muted}>Sample projection: {radiation.projection} mSv</Text>
                <Text style={styles.muted}>{radiation.budget}</Text>
              </View>
            </Card>

            <View style={[styles.smallPair, wide && { flex: 5 }]}>
              <Card style={styles.smallCard}>
                <Text style={styles.label}>Dose rate today</Text>
                <Text style={styles.mediumNumber}>{latest.rate}</Text>
                <Text style={styles.muted}>mSv per day</Text>
              </Card>
              <Card style={styles.smallCard}>
                <Text style={styles.label}>Space weather</Text>
                <Text style={[styles.mediumNumber, { color: theme.colors[radiation.spaceWeather.status] }]}>
                  {radiation.spaceWeather.label}
                </Text>
                <Text style={styles.muted}>{radiation.spaceWeather.detail}</Text>
              </Card>
            </View>
          </View>

          {/* Bottom row: drill, readings, sensitive areas */}
          <View style={[styles.row, wide && styles.rowWide]}>
            <Card style={[styles.drill, wide && { flex: 1 }]}>
              <Text style={styles.cardTitle}>Solar particle event drill</Text>
              <Text style={styles.muted}>
                {drillOn ? 'Drill running. Follow the steps:' : 'Practice the steps for a solar storm:'}
              </Text>
              <View style={styles.steps}>
                {drillSteps.map((s, i) => (
                  <Text key={s} style={styles.body}>{i + 1}. {s}</Text>
                ))}
              </View>
              <View style={styles.spacer} />
              <Pressable style={styles.button} onPress={() => setDrillOn(!drillOn)} accessibilityRole="button">
                <Text style={styles.buttonText}>{drillOn ? 'End drill' : 'Start drill'}</Text>
              </Pressable>
            </Card>

            <Card style={[styles.readingsCard, wide && { flex: 1 }]}>
              <View style={styles.head}>
                <Text style={styles.cardTitle}>Dosimeter readings</Text>
                <Text style={styles.muted}>Manual entry</Text>
              </View>

              <View style={styles.tableHead}>
                <Text style={[styles.th, styles.cDay]}>Day</Text>
                <Text style={[styles.th, styles.cDose]}>Dose (mSv)</Text>
                <Text style={[styles.th, styles.cRate]}>Rate (mSv/day)</Text>
                <Text style={[styles.th, styles.cInst]}>Instrument</Text>
              </View>
              {readings.slice(0, 5).map((r, i) => (
                <View key={`${r.day}-${i}`} style={styles.tr}>
                  <Text style={[styles.td, styles.cDay]}>{r.day}</Text>
                  <Text style={[styles.td, styles.cDose]}>{r.dose}</Text>
                  <Text style={[styles.td, styles.cRate]}>{r.rate}</Text>
                  <Text style={[styles.td, styles.cInst]}>{r.instrument}</Text>
                </View>
              ))}

              <View style={styles.spacer} />

              {logging ? (
                <View style={styles.form}>
                  <TextField label="Total dose" unit="mSv" value={dose}
                    onChangeText={(t) => setDose(t.replace(/[^0-9.]/g, ''))} />
                  <Chips options={instrumentOptions} selected={[instrument]} onPick={setInstrument} />
                  {error ? <Text style={{ color: theme.colors.alert, fontSize: 13 }}>{error}</Text> : null}
                  <View style={styles.formButtons}>
                    <Pressable style={[styles.outline, { flex: 1 }]} onPress={() => { setLogging(false); setError(''); }}>
                      <Text style={styles.outlineText}>Cancel</Text>
                    </Pressable>
                    <Pressable style={[styles.button, { flex: 2 }]} onPress={save}>
                      <Text style={styles.buttonText}>Save reading</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Pressable style={styles.outline} onPress={() => setLogging(true)} accessibilityRole="button">
                  <Text style={styles.outlineText}>Log new reading</Text>
                </Pressable>
              )}
            </Card>

            <Card style={[styles.areasCard, wide && { flex: 0.8 }]}>
              <Text style={styles.label}>Sensitive areas</Text>
              {sensitiveAreas.map((a) => (
                <Text key={a} style={styles.body}>{a}</Text>
              ))}
              <Text style={[styles.muted, { marginTop: 8 }]}>
                After a solar event, early nausea or vomiting means: contact your flight surgeon now.
              </Text>
              <Text style={styles.muted}>
                CSA: about 30% of ISS radiation is neutrons. Budget and limits to be set from NASA-STD-3001.
              </Text>
            </Card>
          </View>
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

  row: { gap: 12 },
  rowWide: { flexDirection: 'row', alignItems: 'stretch' },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: theme.colors.textMuted, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase' },
  badge: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  muted: { color: theme.colors.textMuted, fontSize: 12, lineHeight: 18 },
  body: { color: theme.colors.text, fontSize: 14, lineHeight: 20 },
  cardTitle: { color: theme.colors.text, fontSize: 18, fontWeight: '700' },
  spacer: { flex: 1, minHeight: 16 },

  doseCard: { gap: 8 },
  doseLine: { flexDirection: 'row', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' },
  bigNumber: { color: theme.colors.text, fontSize: 56, fontWeight: '700' },
  doseUnit: { color: theme.colors.textMuted, fontSize: 14 },
  track: { height: 10, backgroundColor: theme.colors.border, borderRadius: 2, overflow: 'hidden' },
  fill: { height: 10 },
  scaleRow: { flexDirection: 'row', justifyContent: 'space-between' },

  smallPair: { flexDirection: 'row', gap: 12 },
  smallCard: { flex: 1, gap: 4 },
  mediumNumber: { color: theme.colors.text, fontSize: 26, fontWeight: '700' },

  drill: { gap: 8, borderLeftWidth: 4, borderLeftColor: theme.colors.alert },
  steps: { gap: 6, marginTop: 4 },
  button: {
    backgroundColor: theme.colors.action,
    borderRadius: theme.radius,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  outline: {
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 16,
    alignItems: 'center',
  },
  outlineText: { color: theme.colors.text, fontSize: 15 },

  readingsCard: { gap: 4 },
  tableHead: { flexDirection: 'row', marginTop: 8, paddingBottom: 8 },
  th: { color: theme.colors.textMuted, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' },
  tr: { flexDirection: 'row', paddingVertical: 12, borderTopWidth: 1, borderTopColor: theme.colors.border },
  td: { color: theme.colors.text, fontSize: 14 },
  cDay: { flex: 0.6 },
  cDose: { flex: 1 },
  cRate: { flex: 1.1 },
  cInst: { flex: 1.5, textAlign: 'right' },
  form: { gap: 10 },
  formButtons: { flexDirection: 'row', gap: 12 },

  areasCard: { gap: 8 },
});