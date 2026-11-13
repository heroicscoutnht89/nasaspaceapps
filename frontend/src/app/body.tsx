import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { mission } from '../data/sample';
import { bodyAreas } from '../data/body';
import { BodyFigure } from '../components/BodyFigure';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { TopStrip } from '../components/TopStrip';

export default function Body() {
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const [selectedId, setSelectedId] = useState('heart');
  const area = bodyAreas.find((a) => a.id === selectedId) ?? bodyAreas[0];

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <TopStrip />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.inner}>
          <Text style={styles.kicker}>
            {mission.name} · Mission day {mission.day} · {mission.phase}
          </Text>
          <Text style={styles.title}>Body view</Text>
          <Text style={styles.hint}>Tap a body area</Text>

          <View style={[styles.layout, wide && styles.layoutWide]}>
            <Card style={styles.figureCard}>
              <BodyFigure areas={bodyAreas} selectedId={selectedId} onSelect={setSelectedId} width={wide ? 340 : 240} />
            </Card>

            <View style={styles.detailCol}>
              <Card style={[styles.detail, { borderLeftColor: theme.colors[area.status] }]}>
                <View style={styles.head}>
                  <Text style={styles.areaName}>{area.name}</Text>
                  <StatusBadge status={area.status} />
                </View>
                <Text style={styles.label}>What spaceflight does</Text>
                <Text style={styles.body}>{area.effect}</Text>
                <Text style={styles.label}>Your readings</Text>
                {area.readings.map((r) => (
                  <Text key={r} style={styles.body}>{r}</Text>
                ))}
                <Text style={styles.label}>What to do</Text>
                <Text style={styles.body}>{area.action}</Text>
              </Card>

              <Text style={styles.label}>All areas</Text>
              {bodyAreas.map((a) => (
                <Pressable
                  key={a.id}
                  onPress={() => setSelectedId(a.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: a.id === selectedId }}
                  style={styles.listRow}
                >
                  <Text style={[styles.listName, a.id === selectedId && styles.listNameOn]}>{a.name}</Text>
                  <StatusBadge status={a.status} />
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
  inner: { width: '100%', maxWidth: 1000, alignSelf: 'center', gap: 8 },
  kicker: { color: theme.colors.textMuted, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase' },
  title: { color: theme.colors.text, fontSize: 28, fontWeight: '700' },
  hint: { color: theme.colors.textMuted, fontSize: 13 },
  layout: { gap: 16, marginTop: 8 },
  layoutWide: { flexDirection: 'row', alignItems: 'flex-start' },
  figureCard: { alignItems: 'center' },
  detailCol: { flex: 1, gap: 8 },
  detail: { borderLeftWidth: 4, gap: 8 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  areaName: { color: theme.colors.text, fontSize: 20, fontWeight: '700' },
  label: { color: theme.colors.textMuted, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 4 },
  body: { color: theme.colors.text, fontSize: 14, lineHeight: 20 },
  listRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, borderTopWidth: 1, borderTopColor: theme.colors.border,
  },
  listName: { color: theme.colors.textMuted, fontSize: 15 },
  listNameOn: { color: theme.colors.text, fontWeight: '700' },
});