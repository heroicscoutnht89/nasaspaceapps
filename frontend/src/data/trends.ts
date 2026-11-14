import type { Status } from '../theme';

export type Metric = {
  id: string;
  label: string;
  unit: string;
  decimals: number;
  status: Status;
  trend: 'Falling' | 'Rising' | 'Steady';
  values: number[];
  min: number;
  max: number;
  baseline: { low: number; high: number } | null;
  flag: number | null;
  suggestion: string;
};

const DAYS = 47;
const days = Array.from({ length: DAYS }, (_, k) => k + 1);
const r = (v: number, d: number) => Number(v.toFixed(d));

const sleep = days.map((i) => r(i <= 42 ? 7 + 0.25 * Math.sin(i * 1.7) : 7 - (i - 42) * 0.38, 1));
const mood = days.map((i) => r(i <= 42 ? 3.6 + 0.3 * Math.sin(i * 1.3) : 3.6 - (i - 42) * 0.32, 1));
const heart = days.map((i) => r(i <= 42 ? 64 + 1.5 * Math.sin(i * 2.1) : 64 + (i - 42) * 1.4, 0));
const dose = days.map((i) => r((i * 214) / DAYS, 0));

export const metrics: Metric[] = [
  {
    id: 'sleep', label: 'Sleep', unit: 'h', decimals: 1, status: 'watch', trend: 'Falling',
    values: sleep, min: 4, max: 9, baseline: { low: 6.5, high: 7.5 }, flag: 5.5,
    suggestion: 'Keep a fixed sleep window, dim lights 1 hour before, and reduce late-day workload. If it continues 2 more days, send a report to the flight surgeon.',
  },
  {
    id: 'mood', label: 'Mood', unit: 'of 5', decimals: 1, status: 'watch', trend: 'Falling',
    values: mood, min: 1, max: 5, baseline: { low: 3.2, high: 4.0 }, flag: 2.5,
    suggestion: 'Talk with the crew or call home, and try the breathing exercise. If low mood continues, contact your flight surgeon.',
  },
  {
    id: 'heart', label: 'Heart rate', unit: 'bpm', decimals: 0, status: 'watch', trend: 'Rising',
    values: heart, min: 55, max: 80, baseline: { low: 60, high: 68 }, flag: 70,
    suggestion: '10 minutes of light cardio, drink water, and re-check tomorrow. If it stays raised for 3 days or you feel chest pain, contact your flight surgeon.',
  },
  {
    id: 'dose', label: 'Radiation dose', unit: 'mSv', decimals: 0, status: 'nominal', trend: 'Steady',
    values: dose, min: 0, max: 250, baseline: null, flag: null,
    suggestion: 'Sample data. Budget and limits are to be set from NASA-STD-3001.',
  },
];