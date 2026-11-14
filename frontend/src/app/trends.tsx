import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { mission } from '../data/sample';
import { Metric, metrics } from '../data/trends';
import { Card } from '../components/Card';
import { Chips } from '../components/Inputs';
import { LineChart } from '../components/LineChart';
import { StatusBadge } from '../components/StatusBadge';
import { TopStrip } from '../components/TopStrip';

const ranges = [
  { label: '7 days', days: 7 },
  { label: '14 days', days: 14 },
  { label: 'Whole mission', days: 0 },
];

const latestText = (m: Metric) => `${m.values[m.values.length - 1].toFixed(m.decimals)} ${m.unit}`;

export default function Trends() {
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const [metricId, setMetricId] = useState('sleep');
  const [rangeLabel, setRangeLabel] = useState('14 days');

  const metric = metrics.find((m) => m.id === metricId) ?? metrics[0];
  const range = ranges.find((r) => r.label === rangeLabel) ?? ranges[1];
  const shown = range.days === 0 ? metric.values : metric.values.slice(-range.days);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <TopStrip />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.inner}>
          <Text style={styles.kicker}>
            {mission.name} · Mission day {mission.day} · sample data
          </Text>
          <Text style={styles.title}>Trends</Text>

          <Chips
            options={metrics.map((m) => m.label)}
            selected={[metric.label]}
            onPick={(l) => setMetricId(metrics.find((m) => m.label === l)?.id ?? 'sleep')}
          />
          <Chips options={ranges.map((r) => r.label)} selected={[range.label]} onPick={setRangeLabel} />

          <View style={[styles.layout, wide && styles.layoutWide]}>
            <View style={styles.main}>
              <Card style={styles.chartCard}>
                <View style={styles.head}>
                  <Text style={styles.metricName}>{metric.label}</Text>
                  <View style={styles.headRight}>
                    <Text style={styles.trend}>{metric.trend}</Text>
                    <StatusBadge status={metric.status} />
                  </View>
                </View>
                <Text style={styles.latest}>{latestText(metric)}</Text>
                <LineChart
                  values={shown}
                  lastDay={mission.day}
                  min={metric.min}
                  max={metric.max}
                  baseline={metric.baseline}
                  flag={metric.flag}
                  color={theme.colors[metric.status]}
                  summary={`${metric.label}, ${metric.trend}, latest ${latestText(metric)}`}
                />
                <Text style={styles.legend}>
                  {metric.baseline ? 'Blue band: your normal range. ' : ''}
                  {metric.flag !== null ? 'Dashed line: flag level.' : ''}
                </Text>
              </Card>
              <Card style={[styles.suggest, { borderLeftColor: theme.colors[metric.status] }]}>
                <Text style={styles.label}>Suggested</Text>
                <Text style={styles.body}>{metric.suggestion}</Text>
              </Card>
            </View>

            <View style={styles.side}>
              <Text style={styles.label}>All indicators</Text>
              {metrics.map((m) => (
                <Pressable
                  key={m.id}
                  onPress={() => setMetricId(m.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: m.id === metric.id }}
                  style={styles.listRow}
                >
                  <View style={styles.listText}>
                    <Text style={[styles.listName, m.id === metric.id && styles.listNameOn]}>{m.label}</Text>
                    <Text style={styles.listValue}>{latestText(m)} · {m.trend}</Text>
                  </View>
                  <StatusBadge status={m.status} />
                </Pressable>
              ))}
            </View>
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
  title: { color: theme.colors.text, fontSize: 28, fontWeight: '700' },
  layout: { gap: 16, marginTop: 4 },
  layoutWide: { flexDirection: 'row', alignItems: 'flex-start' },
  main: { flex: 2, gap: 12 },
  side: { flex: 1, gap: 4 },
  chartCard: { gap: 8 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  metricName: { color: theme.colors.text, fontSize: 18, fontWeight: '700' },
  trend: { color: theme.colors.textMuted, fontSize: 13 },
  latest: { color: theme.colors.text, fontSize: 32, fontWeight: '700' },
  legend: { color: theme.colors.textMuted, fontSize: 12 },
  suggest: { borderLeftWidth: 4, gap: 6 },
  label: { color: theme.colors.textMuted, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase' },
  body: { color: theme.colors.text, fontSize: 14, lineHeight: 20 },
  listRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, borderTopWidth: 1, borderTopColor: theme.colors.border,
  },
  listText: { flex: 1, gap: 2 },
  listName: { color: theme.colors.textMuted, fontSize: 15 },
  listNameOn: { color: theme.colors.text, fontWeight: '700' },
  listValue: { color: theme.colors.textMuted, fontSize: 12 },
});