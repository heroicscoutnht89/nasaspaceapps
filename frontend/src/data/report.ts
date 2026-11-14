import { statusLabel, type Status } from '../theme';
import { mission } from './sample';
import { feelingList, symptomList } from './checkin';
import { num, type SavedCheckin } from './live';
import type { Answers } from './checkin';
import { GUIDANCE, RULES, rulesInfo, doseStatus } from './rules';

export { RULES };

const ID_BY_NAME: Record<string, string> = {
  'Radiation dose': 'dose',
  'Sleep': 'sleep',
  'Mood (1 to 5)': 'mood',
  'Resting heart rate': 'heart',
  'Blood pressure': 'bp',
  'Body temperature': 'temp',
  'Blood sugar': 'glucose',
  'Crew tension (1 to 5)': 'tension',
  'Meals and fluids': 'meals',
  'Exercise': 'exercise',
  'Symptoms': 'symptoms',
};

export type ReportRow = {
  indicator: string;
  today: string;
  baseline: string;
  trend: string;
  status: Status;
};

export type ReportData = {
  hasData: boolean;
  count: number;
  rows: ReportRow[];
  flags: string[];
  actions: string[];
  symptoms: string;
};

function mean(values: number[]): number | null {
  return values.length
    ? values.reduce((a, b) => a + b, 0) / values.length
    : null;
}

function trendOf(today: number | null, base: number | null, tol: number): string {
  if (today === null) return '—';
  if (base === null) return 'No baseline yet';
  if (today - base > tol) return 'Rising';
  if (today - base < -tol) return 'Falling';
  return 'Steady';
}

// latest value, baseline (average of up to 7 earlier check-ins) and trend
function stats(
  list: SavedCheckin[],
  pick: (a: Answers) => number | null,
  tol: number,
) {
  const latest = pick(list[list.length - 1].answers);

  const prior = list
    .slice(-8, -1)
    .map((c) => pick(c.answers))
    .filter((v): v is number => v !== null);

  const base = mean(prior);

  return { latest, base, trend: trendOf(latest, base, tol) };
}

// how many check-ins in a row, counting back from the latest, match the test
function streak(
  list: SavedCheckin[],
  pick: (a: Answers) => number | null,
  test: (v: number) => boolean,
) {
  let n = 0;

  for (let i = list.length - 1; i >= 0; i--) {
    const v = pick(list[i].answers);

    if (v !== null && test(v)) n++;
    else break;
  }

  return n;
}

const fmt = (v: number | null, unit = '', digits = 1) =>
  v === null
    ? 'Not entered'
    : `${Number.isInteger(v) ? v : v.toFixed(digits)}${unit ? ' ' + unit : ''}`;

export function buildReport(
  list: SavedCheckin[],
  doseMsv: number | null = null,
): ReportData {
  if (list.length === 0) {
    return {
      hasData: false,
      count: 0,
      rows: [],
      flags: [],
      actions: [],
      symptoms: '',
    };
  }

  const last = list[list.length - 1].answers;
  const rows: ReportRow[] = [];
  const flags: string[] = [];

  // Sleep
  const sleepPick = (a: Answers) => num(a.sleepHours);
  const sleep = stats(list, sleepPick, 0.5);

  let sleepStatus: Status = 'nominal';

  if (sleep.latest !== null) {
    if (sleep.latest < RULES.sleepAction) sleepStatus = 'alert';
    else if (sleep.latest < RULES.sleepWatch) sleepStatus = 'watch';
  }

  rows.push({
    indicator: 'Sleep',
    today: fmt(sleep.latest, 'h'),
    baseline: fmt(sleep.base, 'h'),
    trend: sleep.trend,
    status: sleepStatus,
  });

  const lowSleep = streak(list, sleepPick, (v) => v < RULES.sleepWatch);

  if (lowSleep >= RULES.streak) {
    flags.push(
      `Sleep below ${RULES.sleepWatch} h for ${lowSleep} check-ins in a row`,
    );
  }

  // Mood
  const moodPick = (a: Answers) => a.mood;
  const mood = stats(list, moodPick, 0.5);

  rows.push({
    indicator: 'Mood (1 to 5)',
    today: fmt(mood.latest),
    baseline: fmt(mood.base),
    trend: mood.trend,
    status:
      mood.latest !== null && mood.latest <= RULES.moodWatch
        ? 'watch'
        : 'nominal',
  });

  const lowMood = streak(list, moodPick, (v) => v <= RULES.moodWatch);

  if (lowMood >= RULES.streak) {
    flags.push(`Mood low for ${lowMood} check-ins in a row`);
  }

  // Resting heart rate
  const heart = stats(list, (a) => num(a.heartRate), 2);

  let heartStatus: Status = 'nominal';

  if (heart.latest !== null) {
    const jump =
      heart.base !== null && heart.latest - heart.base >= RULES.heartJump;

    if (
      heart.latest > RULES.heartHigh ||
      heart.latest < RULES.heartLow ||
      jump
    ) {
      heartStatus = 'watch';
    }
  }

  rows.push({
    indicator: 'Resting heart rate',
    today: fmt(heart.latest, 'bpm'),
    baseline: fmt(heart.base, 'bpm'),
    trend: heart.trend,
    status: heartStatus,
  });

  // Blood pressure
  const sys = num(last.systolic);
  const dia = num(last.diastolic);
  const sysBase = stats(list, (a) => num(a.systolic), 4).base;
  const diaBase = stats(list, (a) => num(a.diastolic), 4).base;

  let bpStatus: Status = 'nominal';

  if (sys !== null && dia !== null) {
    if (
      sys >= RULES.sysWatch ||
      dia >= RULES.diaWatch ||
      sys < RULES.sysLow
    ) {
      bpStatus = 'watch';
    }
  }

  rows.push({
    indicator: 'Blood pressure',
    today:
      sys !== null && dia !== null
        ? `${sys}/${dia} mmHg`
        : 'Not entered',
    baseline:
      sysBase !== null && diaBase !== null
        ? `${Math.round(sysBase)}/${Math.round(diaBase)} mmHg`
        : '—',
    trend: trendOf(sys, sysBase, 4),
    status: bpStatus,
  });

  // Temperature
  const temp = stats(list, (a) => num(a.temperature), 0.3);

  let tempStatus: Status = 'nominal';

  if (temp.latest !== null) {
    if (temp.latest >= RULES.tempAction) tempStatus = 'alert';
    else if (
      temp.latest >= RULES.tempHigh ||
      temp.latest < RULES.tempLow
    ) {
      tempStatus = 'watch';
    }
  }

  rows.push({
    indicator: 'Body temperature',
    today: fmt(temp.latest, '°C'),
    baseline: fmt(temp.base, '°C'),
    trend: temp.trend,
    status: tempStatus,
  });

  // Blood sugar (only if the crew member entered it)
  const glucose = stats(list, (a) => num(a.glucose), 8);

  if (glucose.latest !== null) {
    rows.push({
      indicator: 'Blood sugar',
      today: fmt(glucose.latest, 'mg/dL'),
      baseline: fmt(glucose.base, 'mg/dL'),
      trend: glucose.trend,
      status:
        glucose.latest < RULES.glucoseLow ||
        glucose.latest > RULES.glucoseHigh
          ? 'watch'
          : 'nominal',
    });
  }

  // Crew tension
  const tension = stats(list, (a) => a.crewTension, 0.5);

  rows.push({
    indicator: 'Crew tension (1 to 5)',
    today: fmt(tension.latest),
    baseline: fmt(tension.base),
    trend: tension.trend,
    status:
      tension.latest !== null && tension.latest >= RULES.tensionWatch
        ? 'watch'
        : 'nominal',
  });

  // Meals: reads the first number in the saved answer, e.g. "2 of 3"
  const mealsEaten = parseInt(last.meals ?? '', 10);

  rows.push({
    indicator: 'Meals and fluids',
    today: `${last.meals ?? 'Not entered'}${last.fluids ? ` · ${last.fluids} L` : ''}`,
    baseline: '—',
    trend: '—',
    status:
      Number.isFinite(mealsEaten) && mealsEaten < 3
        ? 'watch'
        : 'nominal',
  });

  // Exercise
  const ex = stats(list, (a) => num(a.exerciseMinutes), 5);

  rows.push({
    indicator: 'Exercise',
    today: fmt(ex.latest, 'min'),
    baseline: fmt(ex.base, 'min'),
    trend: ex.trend,
    status:
      ex.latest !== null && ex.latest < RULES.exerciseMin
        ? 'watch'
        : 'nominal',
  });

  // Symptoms
  const yes = symptomList
    .filter((s) => last.symptoms[s.id])
    .map((s) => s.label);

  const feelings = feelingList
    .filter((f) => last.feelings[f.id])
    .map((f) => f.label);

  const nausea = !!last.symptoms['nausea'];

  rows.push({
    indicator: 'Symptoms',
    today: yes.length ? `${yes.length} reported` : 'None',
    baseline: '—',
    trend: '—',
    status: nausea ? 'alert' : yes.length ? 'watch' : 'nominal',
  });

  if (nausea) {
    flags.push('Nausea or vomiting reported: contact your flight surgeon now');
  }

  // Radiation stays sample data until the radiation feed is connected (Step 8)
  // rows.push({ indicator: 'Radiation dose (sample)', today: '214 mSv', baseline: 'budget to be set', trend: 'Steady', status: 'watch' });
  rows.push(
    doseMsv !== null
      ? {
          indicator: 'Radiation dose',
          today: `${Math.round(doseMsv)} mSv`,
          baseline: `career limit ${RULES.doseCareerMsv} mSv`,
          trend: '—',
          status: doseStatus(doseMsv),
        }
      : {
          indicator: 'Radiation dose (sample)',
          today: '214 mSv',
          baseline: '',
          trend: 'Steady',
          status: 'watch',
        },
  );

  // One flag per non-normal indicator
  for (const r of rows) {
    if (
      r.status !== 'nominal' &&
      r.indicator !== 'Symptoms' &&
      !r.indicator.includes('(sample)')
    ) {
      flags.push(`${r.indicator}: ${r.today} (${statusLabel[r.status]})`);
    }
  }

  const actions = rows
    .filter((r) => r.status !== 'nominal')
    .map((r) => {
      const g = GUIDANCE[ID_BY_NAME[r.indicator]];

      return g
        ? `${r.indicator}: ${r.status === 'alert' ? g.alert : g.watch}`
        : null;
    })
    .filter((a): a is string => a !== null);

  const parts: string[] = [];

  parts.push(
    yes.length
      ? `Reported: ${yes.join(', ')}.`
      : 'No symptoms reported.',
  );

  if (feelings.length) {
    parts.push(`Feeling: ${feelings.join(', ')}.`);
  }

  return {
    hasData: true,
    count: list.length,
    rows,
    flags,
    actions,
    symptoms: parts.join(' '),
  };
}

export function buildReportText(data: ReportData, note: string): string {
  const lines = [
    'FLIGHT SURGEON REPORT',
    `${mission.name} · Mission day ${mission.day} · ${mission.phase}`,
    `Generated ${new Date().toISOString()} · based on ${data.count} saved check-in${data.count === 1 ? '' : 's'}`,
    `Rules: ${rulesInfo.source}, version ${rulesInfo.version}`,
    '',
    'ACTIVE FLAGS',
    ...(data.flags.length ? data.flags.map((f) => `- ${f}`) : ['- None']),
    '',
    'RECOMMENDED ACTIONS',
    ...(data.actions.length
      ? data.actions.map((a) => `- ${a}`)
      : ['- None']),
    '',
    'INDICATORS (today | baseline | trend | status)',
    ...data.rows.map(
      (r) =>
        `- ${r.indicator}: ${r.today} | ${r.baseline} | ${r.trend} | ${statusLabel[r.status].toUpperCase()}`,
    ),
    '',
    'SYMPTOMS REPORTED',
    data.symptoms,
  ];

  if (note.trim()) {
    lines.push('', 'NOTE FROM CREW MEMBER', note.trim());
  }

  return lines.join('\n');
}