import AsyncStorage from '@react-native-async-storage/async-storage';
import { emptyAnswers, type Answers } from './checkin';
import { CUMULATIVE, DOSE_KEYS } from './liveTrends';
import type { SavedCheckin } from './live';
import type { SavedReading } from './storage';

const API = process.env.EXPO_PUBLIC_API_URL;
const DAY = 24 * 60 * 60 * 1000;
const N = 30;
const SOLAR_KEY = 'solarEvent';
const SOLAR_HOURS = 24;

async function read<T>(key: string): Promise<T[]> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

function doseKeyOf(reading: unknown): string | null {
  const r = reading as Record<string, unknown> | null;
  if (!r) return null;
  return (
    DOSE_KEYS.find((k) => {
      const v = r[k];
      return typeof v === 'number' || (typeof v === 'string' && v !== '' && !isNaN(Number(v)));
    }) ?? null
  );
}

function withDose(template: unknown, key: string, dose: number) {
  const t = template as Record<string, unknown>;
  return { ...t, [key]: typeof t[key] === 'string' ? String(dose) : dose };
}

export async function loadDemoHistory(): Promise<string> {
  const tailSleep = [7.0, 6.9, 6.8, 6.0, 5.4, 5.2, 5.1];
  const tailMood = [4, 3, 3, 3, 2, 2, 2];
  const tailHeart = [64, 65, 66, 67, 69, 70, 71];
  const now = Date.now();

  const checkins: SavedCheckin[] = [];
  for (let i = 0; i < N; i++) {
    const fromEnd = N - 1 - i; // 0 = today
    const t = fromEnd < 7 ? 6 - fromEnd : -1;
    const sleep = t >= 0 ? tailSleep[t] : 7 + 0.3 * Math.sin(i * 1.7);
    const mood = t >= 0 ? tailMood[t] : Math.round(3.6 + 0.4 * Math.sin(i * 1.3));
    const heart = t >= 0 ? tailHeart[t] : Math.round(64 + 1.5 * Math.sin(i * 2.1));
    const answers: Answers = {
      ...emptyAnswers,
      heartRate: String(heart),
      systolic: String(116 + (i % 3)),
      diastolic: String(76 + (i % 2)),
      temperature: (36.6 + 0.1 * Math.sin(i)).toFixed(1),
      mood,
      crewTension: fromEnd < 3 ? 3 : 2,
      feelings: fromEnd <= 2 ? { nervous: true, sleepTrouble: true } : {},
      symptoms: fromEnd <= 1 ? { vision: true } : {},
      sleepHours: sleep.toFixed(1),
      bedtime: '00:10',
      wakeTime: '05:20',
      light: 'Normal',
      exerciseMinutes: fromEnd < 7 ? '42' : '55',
      exerciseTypes: ['Resistive', 'Cardio'],
      meals: fromEnd <= 1 ? '2 of 3' : '3 of 3',
      appetite: fromEnd <= 1 ? 'Low' : 'Normal',
      fluids: fromEnd <= 1 ? '1.8' : '2.0',
    };
    checkins.push({ id: `demo-${i}`, savedAt: new Date(now - fromEnd * DAY).toISOString(), synced: false, answers });
  }
  await AsyncStorage.setItem('checkins', JSON.stringify(checkins));

  const existing = await read<SavedReading>('readings');
  const template = existing.find((r) => doseKeyOf(r.reading));
  if (!template) {
    return `Loaded ${N} days of check-ins. For radiation history, save one reading in the Radiation tab first, then load again.`;
  }
  const key = doseKeyOf(template.reading) as string;
  const readings = Array.from({ length: N }, (_, i) => ({
    id: `demo-r-${i}`,
    savedAt: new Date(now - (N - 1 - i) * DAY).toISOString(),
    synced: false,
    reading: withDose(template.reading, key, Math.round(((i + 1) * 214) / N)),
  })) as SavedReading[];
  await AsyncStorage.setItem('readings', JSON.stringify(readings));
  return `Loaded ${N} days of check-ins and radiation readings.`;
}

export async function simulateSolarEvent(): Promise<string> {
  await AsyncStorage.setItem(SOLAR_KEY, JSON.stringify({ at: new Date().toISOString() }));
  const readings = (await read<SavedReading>('readings')).sort((a, b) => a.savedAt.localeCompare(b.savedAt));
  const last = readings[readings.length - 1];
  const key = last ? doseKeyOf(last.reading) : null;
  if (!last || !key) {
    return 'Solar alert on. Save one radiation reading first if you also want a dose jump.';
  }
  const current = Number((last.reading as Record<string, unknown>)[key]);
  const jump = 35; // illustrative; NASA's limit is 250 mSv per event
  readings.push({
    id: `demo-r-solar-${Date.now()}`,
    savedAt: new Date().toISOString(),
    synced: false,
    reading: withDose(last.reading, key, Math.round(CUMULATIVE ? current + jump : jump)),
  } as SavedReading);
  await AsyncStorage.setItem('readings', JSON.stringify(readings));
  return `Solar event simulated: alert on and dose up by ${jump} mSv.`;
}

export async function isSolarActive(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(SOLAR_KEY);
    if (!raw) return false;
    const at = new Date(JSON.parse(raw).at).getTime();
    return Date.now() - at < SOLAR_HOURS * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export async function resetEverything(): Promise<string> {
  await AsyncStorage.multiRemove(['checkins', 'readings', 'reportQueue', SOLAR_KEY]);
  if (!API) return 'Device cleared.';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(`${API}/demo/reset`, { method: 'DELETE', signal: controller.signal });
    return res.ok ? 'Device and database cleared.' : 'Device cleared. The server refused (is DEMO_MODE=1 set?).';
  } catch {
    return 'Device cleared. The server could not be reached.';
  } finally {
    clearTimeout(timer);
  }
}