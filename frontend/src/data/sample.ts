import type { Status } from '../theme';

export const mission = { name: 'Ares 3', day: 47, phase: 'Mars transit' };

export const link = { delayMinutes: 14, queued: 3 };

export const overall = {
  score: 82,
  status: 'watch' as Status,
  message: 'Sleep and mood have dropped for 3 days. Check-in is due.',
};

export const hazards: { id: string; name: string; detail: string; status: Status }[] = [
  { id: 'radiation', name: 'Space Radiation', detail: 'Sample dose data', status: 'watch' },
  { id: 'isolation', name: 'Isolation and Confinement', detail: 'Mood 2.8 vs baseline 3.6', status: 'watch' },
  { id: 'distance', name: 'Distance from Earth', detail: 'Offline mode ready · 3 entries queued', status: 'nominal' },
  { id: 'gravity', name: 'Gravity Fields', detail: 'HR 64 bpm · exercise 42 min', status: 'nominal' },
  { id: 'environment', name: 'Hostile/Closed Environments', detail: 'Temp 36.7 C · hydration on track', status: 'nominal' },
];