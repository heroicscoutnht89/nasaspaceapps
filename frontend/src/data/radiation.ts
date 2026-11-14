import type { Status } from '../theme';

export type Reading = {
  day: number;
  dose: number; // cumulative, mSv
  rate: number; // mSv per day
  instrument: string;
};

export const radiation = {
  budget: 600, // sample budget, to be set from NASA-STD-3001
  projection: 540,
  status: 'watch' as Status,
  spaceWeather: { label: 'Quiet', detail: 'no solar event expected', status: 'nominal' as Status },
};

// Newest first
export const readings: Reading[] = [
  { day: 47, dose: 214, rate: 1.4, instrument: 'Active dosimeter' },
  { day: 46, dose: 212.6, rate: 1.4, instrument: 'Active dosimeter' },
  { day: 45, dose: 211.2, rate: 1.3, instrument: 'Bubble detector' },
  { day: 44, dose: 209.9, rate: 1.4, instrument: 'Active dosimeter' },
];

export const instrumentOptions = ['Active dosimeter', 'Bubble detector'];

export const drillSteps = [
  'Move to the most shielded area.',
  'Stay there until the all-clear.',
  'Log your dose and symptoms.',
];

export const sensitiveAreas = [
  'Blood and bone marrow',
  'Gut',
  'Eye lenses',
  'Brain',
  'Heart and vessels',
  'Skin',
];