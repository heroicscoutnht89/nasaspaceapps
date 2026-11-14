import { statusLabel, type Status } from '../theme';
import { mission } from './sample';

export type ReportRow = {
  indicator: string;
  today: string;
  baseline: string;
  trend: string;
  status: Status;
};

export const reportRows: ReportRow[] = [
  { indicator: 'Sleep', today: '5.1 h', baseline: '7.0 h', trend: 'Falling', status: 'watch' },
  { indicator: 'Mood (1 to 5)', today: '2', baseline: '3.6', trend: 'Falling', status: 'watch' },
  { indicator: 'Resting heart rate', today: '71 bpm', baseline: '64 bpm', trend: 'Rising', status: 'watch' },
  { indicator: 'Blood pressure', today: '118/76 mmHg', baseline: '116/76 mmHg', trend: 'Steady', status: 'nominal' },
  { indicator: 'Body temperature', today: '36.7 °C', baseline: '36.6 °C', trend: 'Steady', status: 'nominal' },
  { indicator: 'Crew tension (1 to 5)', today: '3', baseline: '2', trend: 'Rising', status: 'watch' },
  { indicator: 'Meals and fluids', today: '2 of 3 meals', baseline: '3 of 3 meals', trend: 'Falling', status: 'watch' },
  { indicator: 'Exercise', today: '42 min', baseline: 'goal 60 min', trend: 'Steady', status: 'nominal' },
  { indicator: 'Radiation dose (sample)', today: '214 mSv', baseline: 'budget to be set', trend: 'Steady', status: 'watch' },
];

export const activeFlags = [
  'Sleep below the flag level for 3 nights',
  'Mood down 3 days in a row',
  'Resting heart rate up 7 bpm from baseline',
];

export const symptomsReported =
  'Blurred or changed vision, unusual tiredness, nervous or on edge, hard to sleep. No nausea, headache or dizziness.';

export function buildReportText(note: string): string {
  const lines = [
    'FLIGHT SURGEON REPORT',
    `${mission.name} · Mission day ${mission.day} · ${mission.phase}`,
    `Generated ${new Date().toISOString()} (sample data)`,
    '',
    'ACTIVE FLAGS',
    ...activeFlags.map((f) => `- ${f}`),
    '',
    'INDICATORS (today | baseline | trend | status)',
    ...reportRows.map(
      (r) => `- ${r.indicator}: ${r.today} | ${r.baseline} | ${r.trend} | ${statusLabel[r.status].toUpperCase()}`,
    ),
    '',
    'SYMPTOMS REPORTED',
    symptomsReported,
  ];
  if (note.trim()) lines.push('', 'NOTE FROM CREW MEMBER', note.trim());
  return lines.join('\n');
}