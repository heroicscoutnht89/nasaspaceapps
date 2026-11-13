import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';
import {
  Answers, appetiteOptions, exerciseOptions, feelingList, lightOptions, mealOptions, symptomList,
} from '../data/checkin';
import { Card } from './Card';
import { Chips, Scale, SectionLabel, TextField, YesNoRow } from './Inputs';

type P = { a: Answers; set: (patch: Partial<Answers>) => void };

const digits = (t: string) => t.replace(/[^0-9]/g, '');
const decimal = (t: string) => t.replace(/[^0-9.]/g, '');

export function VitalsStep({ a, set }: P) {
  return (
    <View style={s.stack}>
      <TextField label="Resting heart rate" unit="bpm"
        hint="Rest for 5 minutes. Use your wearable, or count your pulse for 30 seconds and double it."
        value={a.heartRate} onChangeText={(t) => set({ heartRate: digits(t) })} />
      <View style={s.pair}>
        <View style={s.half}>
          <TextField label="Blood pressure, top" unit="mmHg" value={a.systolic}
            onChangeText={(t) => set({ systolic: digits(t) })} />
        </View>
        <View style={s.half}>
          <TextField label="Blood pressure, bottom" unit="mmHg" value={a.diastolic}
            onChangeText={(t) => set({ diastolic: digits(t) })} />
        </View>
      </View>
      <TextField label="Body temperature" unit="°C" hint="Use the onboard thermometer."
        value={a.temperature} onChangeText={(t) => set({ temperature: decimal(t) })} />
      <TextField label="Blood glucose (optional)" unit="mg/dL" hint="Only if you have a reading today."
        value={a.glucose} onChangeText={(t) => set({ glucose: decimal(t) })} />
    </View>
  );
}

export function MentalStep({ a, set }: P) {
  return (
    <View style={s.stack}>
      <SectionLabel>Mood</SectionLabel>
      <Scale value={a.mood} onChange={(n) => set({ mood: n })} low="Low" high="Great" />
      <SectionLabel>Tension in the crew today</SectionLabel>
      <Scale value={a.crewTension} onChange={(n) => set({ crewTension: n })} low="None" high="High" />
      <SectionLabel>In the last 24 hours, did you feel</SectionLabel>
      <View>
        {feelingList.map((f) => (
          <YesNoRow key={f.id} label={f.label} value={!!a.feelings[f.id]}
            onChange={(v) => set({ feelings: { ...a.feelings, [f.id]: v } })} />
        ))}
      </View>
      <Card>
        <Text style={s.note}>
          <Text style={s.bold}>Why we ask: </Text>
          long isolation can lower mood and sleep quality. Tracking it early helps you act before it builds.
        </Text>
      </Card>
    </View>
  );
}

export function SymptomsStep({ a, set }: P) {
  return (
    <View style={s.stack}>
      <View>
        {symptomList.map((sym) => (
          <YesNoRow key={sym.id} label={sym.label} value={!!a.symptoms[sym.id]}
            onChange={(v) => set({ symptoms: { ...a.symptoms, [sym.id]: v } })} />
        ))}
      </View>
      <Card style={{ borderLeftWidth: 4, borderLeftColor: theme.colors.alert }}>
        <Text style={s.note}>
          <Text style={s.bold}>After a solar event: </Text>
          nausea or vomiting means contact your flight surgeon now.
        </Text>
      </Card>
      <Card>
        <Text style={s.note}>
          <Text style={s.bold}>Why we ask: </Text>
          eye and vision changes are a known spaceflight risk. Reporting them early helps.
        </Text>
      </Card>
    </View>
  );
}

export function LifestyleStep({ a, set }: P) {
  const toggleType = (o: string) =>
    set({
      exerciseTypes: a.exerciseTypes.includes(o)
        ? a.exerciseTypes.filter((x) => x !== o)
        : [...a.exerciseTypes, o],
    });
  return (
    <View style={s.stack}>
      <SectionLabel>Sleep</SectionLabel>
      <TextField label="Hours slept" unit="h" value={a.sleepHours}
        onChangeText={(t) => set({ sleepHours: decimal(t) })} />
      <View style={s.pair}>
        <View style={s.half}>
          <TextField label="Bedtime" numeric={false} placeholder="00:10" value={a.bedtime}
            onChangeText={(t) => set({ bedtime: t })} />
        </View>
        <View style={s.half}>
          <TextField label="Wake time" numeric={false} placeholder="05:20" value={a.wakeTime}
            onChangeText={(t) => set({ wakeTime: t })} />
        </View>
      </View>
      <Text style={s.label}>Light in your quarters</Text>
      <Chips options={lightOptions} selected={a.light ? [a.light] : []} onPick={(o) => set({ light: o })} />

      <SectionLabel>Exercise · any type counts</SectionLabel>
      <TextField label="Minutes today" unit="min" value={a.exerciseMinutes}
        onChangeText={(t) => set({ exerciseMinutes: digits(t) })} />
      <Chips options={exerciseOptions} selected={a.exerciseTypes} onPick={toggleType} />

      <SectionLabel>Food and fluids</SectionLabel>
      <Text style={s.label}>Meals eaten (of 3)</Text>
      <Chips options={mealOptions} selected={a.meals ? [a.meals] : []} onPick={(o) => set({ meals: o })} />
      <Text style={s.label}>Appetite</Text>
      <Chips options={appetiteOptions} selected={a.appetite ? [a.appetite] : []} onPick={(o) => set({ appetite: o })} />
      <TextField label="Fluids" unit="L" value={a.fluids} onChangeText={(t) => set({ fluids: decimal(t) })} />
    </View>
  );
}

const yesList = (map: Record<string, boolean>, list: { id: string; label: string }[]) =>
  list.filter((i) => map[i.id]).map((i) => i.label).join(', ') || 'None';
const show = (v: string, unit: string) => (v ? `${v} ${unit}` : 'Not entered');

export function ReviewStep({ a }: { a: Answers }) {
  const rows: [string, string][] = [
    ['Resting heart rate', show(a.heartRate, 'bpm')],
    ['Blood pressure', a.systolic && a.diastolic ? `${a.systolic}/${a.diastolic} mmHg` : 'Not entered'],
    ['Body temperature', show(a.temperature, '°C')],
    ['Blood glucose', show(a.glucose, 'mg/dL')],
    ['Mood', a.mood === null ? 'Not answered' : `${a.mood} of 5`],
    ['Crew tension', a.crewTension === null ? 'Not answered' : `${a.crewTension} of 5`],
    ['Feelings', yesList(a.feelings, feelingList)],
    ['Symptoms', yesList(a.symptoms, symptomList)],
    ['Sleep', show(a.sleepHours, 'h')],
    ['Exercise', `${a.exerciseMinutes || '0'} min ${a.exerciseTypes.join(', ')}`.trim()],
    ['Meals', a.meals ? `${a.meals} of 3` : 'Not answered'],
    ['Appetite', a.appetite ?? 'Not answered'],
    ['Fluids', show(a.fluids, 'L')],
  ];
  return (
    <View>
      {rows.map(([k, v]) => (
        <View key={k} style={s.reviewRow}>
          <Text style={s.reviewKey}>{k}</Text>
          <Text style={s.reviewVal}>{v}</Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  stack: { gap: 12 },
  pair: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  label: { color: theme.colors.text, fontSize: 15, fontWeight: '700' },
  note: { color: theme.colors.textMuted, fontSize: 13, lineHeight: 19 },
  bold: { color: theme.colors.text, fontWeight: '700' },
  reviewRow: {
    flexDirection: 'row', justifyContent: 'space-between', gap: 12,
    paddingVertical: 11, borderTopWidth: 1, borderTopColor: theme.colors.border,
  },
  reviewKey: { color: theme.colors.textMuted, fontSize: 14, flex: 1 },
  reviewVal: { color: theme.colors.text, fontSize: 14, flex: 1, textAlign: 'right' },
});