import type { Status } from '../theme';
import { metrics as sampleMetrics, type Metric } from './trends';
import { RULES } from './report';
import { GUIDANCE, doseStatus } from './rules';
import { loadReadings, type SavedReading } from './storage';
import { getSavedCheckins, num, type SavedCheckin } from './live';

// Radiation readings: adjust these two lines if your teammate's Reading uses other names.
export const DOSE_KEYS = ['doseMsv', 'dose', 'msv', 'value'];
export const CUMULATIVE = true; // true: each reading is the running total. false: each reading is added to the total

function doseOf(reading: unknown): number | null {
  const r = reading as Record<string, unknown> | null;
  for (const k of DOSE_KEYS) {
    const v = r?.[k];
    const n = typeof v === 'number' ? v : typeof v === 'string' ? num(v) : null;
    if (n !== null) return n;
  }
  return null;
}

export function doseSeries(readings: SavedReading[]): number[] {
  const sorted = [...readings].sort((a, b) => a.savedAt.localeCompare(b.savedAt));
  const out: number[] = [];
  let total = 0;
  for (const s of sorted) {
    const d = doseOf(s.reading);
    if (d === null) continue;
    total = CUMULATIVE ? d : total + d;
    out.push(total);
  }
  return out;
}

export function latestDose(readings: SavedReading[]): number | null {
  const s = doseSeries(readings);
  return s.length ? s[s.length - 1] : null;
}

const mean = (v: number[]) => (v.length ? v.reduce((a, b) => a + b, 0) / v.length : null);
const sd = (v: number[], m: number) => Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / v.length);

type Opts = {
  status: (latest: number, base: number | null) => Status;
  flag: (base: number | null) => number | null;
  tol: number;
  minSpread: number;
  fixed?: { min: number; max: number };
  floorZero?: boolean;
  band?: boolean;
  suggestion?: string;
};

function make(id: string, label: string, unit: string, decimals: number, values: number[], o: Opts): Metric {
  const sample = sampleMetrics.find((m) => m.id === id);
  const latest = values.length ? values[values.length - 1] : null;
  const prior = values.slice(-15, -1);
  const base = mean(prior);
  const spread = base === null ? 0 : Math.max(sd(prior, base), o.minSpread);
  const baseline =
    o.band !== false && base !== null && prior.length >= 3 ? { low: base - spread, high: base + spread } : null;
  const flag = o.flag(base);

  let trend: Metric['trend'] = 'Steady';
  if (latest !== null && base !== null) {
    if (latest - base > o.tol) trend = 'Rising';
    else if (latest - base < -o.tol) trend = 'Falling';
  }

  const status: Status = latest === null ? 'nominal' : o.status(latest, base);

  const all = [...values, ...(flag !== null ? [flag] : []), ...(baseline ? [baseline.low, baseline.high] : [])];
  let lo = all.length ? Math.min(...all) : 0;
  let hi = all.length ? Math.max(...all) : 1;
  if (o.fixed) {
    lo = o.fixed.min;
    hi = o.fixed.max;
  } else {
    const pad = Math.max((hi - lo) * 0.15, 0.5);
    lo -= pad;
    hi += pad;
    if (o.floorZero) lo = Math.max(lo, 0);
  }

  return {
    id, label, unit, decimals,
    status,
    trend, values, min: lo, max: hi, baseline, flag,
    suggestion:
      latest !== null && status !== 'nominal' && GUIDANCE[id]
        ? status === 'alert' ? GUIDANCE[id].alert : GUIDANCE[id].watch
        : o.suggestion ?? sample?.suggestion ?? '',
  };
}

const series = (list: SavedCheckin[], pick: (c: SavedCheckin) => number | null) =>
  list.map(pick).filter((v): v is number => v !== null);

export function buildLiveMetrics(list: SavedCheckin[], readings: SavedReading[]): Metric[] {
  return [
    make('sleep', 'Sleep', 'h', 1, series(list, (c) => num(c.answers.sleepHours)), {
      status: (v) => (v < RULES.sleepAction ? 'alert' : v < RULES.sleepWatch ? 'watch' : 'nominal'),
      flag: () => RULES.sleepWatch, tol: 0.5, minSpread: 0.4,
    }),
    make('mood', 'Mood', 'of 5', 1, series(list, (c) => c.answers.mood), {
      status: (v) => (v <= RULES.moodWatch ? 'watch' : 'nominal'),
      flag: () => RULES.moodWatch, tol: 0.5, minSpread: 0.4, fixed: { min: 1, max: 5 },
    }),
    make('heart', 'Heart rate', 'bpm', 0, series(list, (c) => num(c.answers.heartRate)), {
      status: (v, b) =>
        v > RULES.heartHigh || v < RULES.heartLow || (b !== null && v - b >= RULES.heartJump) ? 'watch' : 'nominal',
      flag: (b) => (b !== null ? b + RULES.heartJump : null), tol: 2, minSpread: 3,
    }),
    make('dose', 'Radiation dose', 'mSv', 0, doseSeries(readings), {
      status: (v) => doseStatus(v),
      flag: () => RULES.doseCareerMsv * RULES.doseWatchFrac,
      tol: 1, minSpread: 0, band: false, floorZero: true,
    }),
  ];
}

export async function loadLiveMetrics(): Promise<Metric[]> {
  const [list, readings] = await Promise.all([getSavedCheckins(), loadReadings()]);
  return buildLiveMetrics(list, readings);
}