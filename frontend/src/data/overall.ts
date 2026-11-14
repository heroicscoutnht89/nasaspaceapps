import { theme } from '../theme';
import { buildReport } from './report';
import { getSavedCheckins } from './live';
import { latestDose } from './liveTrends';
import { loadReadings } from './storage';

export type Overall = { score: number | null; label: string; color: string; message: string };

export const emptyOverall: Overall = {
  score: null, label: 'No data', color: theme.colors.textMuted,
  message: 'Complete your first daily check-in to see your status.',
};

export async function loadOverall(): Promise<Overall> {
  const [list, readings] = await Promise.all([getSavedCheckins(), loadReadings()]);
  const report = buildReport(list, latestDose(readings));
  if (!report.hasData) return emptyOverall;

  const rows = report.rows.filter((r) => !r.indicator.includes('(sample)'));
  const watch = rows.filter((r) => r.status === 'watch').length;
  const alert = rows.filter((r) => r.status === 'alert').length;
  const score = Math.max(0, 100 - watch * 6 - alert * 20);

  if (alert > 0) {
    return { score, label: 'Action', color: theme.colors.alert, message: 'One or more indicators need action. Open the report and contact your flight surgeon.' };
  }
  if (watch > 0) {
    return { score, label: 'Watch', color: theme.colors.watch, message: `${watch} indicator${watch === 1 ? '' : 's'} outside your normal range. See Trends and the report.` };
  }
  return { score, label: 'Nominal', color: theme.colors.nominal, message: 'All indicators are in your normal range.' };
}