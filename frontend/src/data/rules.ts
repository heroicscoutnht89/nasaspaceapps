import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Status } from '../theme';

const API = process.env.EXPO_PUBLIC_API_URL;
const CACHE_KEY = 'rulesCache';

// Built-in defaults, used until the server's rules arrive (and whenever it is unreachable).
export const RULES: Record<string, number> = {
  doseCareerMsv: 600, doseWatchFrac: 0.5, doseActionFrac: 0.8,
  sleepWatch: 6, sleepAction: 4.5,
  moodWatch: 2,
  tensionWatch: 4,
  heartJump: 8, heartHigh: 100, heartLow: 50,
  sysWatch: 130, diaWatch: 85, sysLow: 90,
  tempHigh: 37.6, tempLow: 36.0, tempAction: 38.3,
  exerciseMin: 30,
  glucoseLow: 70, glucoseHigh: 140,
  streak: 3,
};

export type GuidanceEntry = { watch: string; alert: string };

export const GUIDANCE: Record<string, GuidanceEntry> = {
   dose: {
    watch: 'Above half of the 600 mSv career limit. Review shelter time and activities with your flight surgeon.',
    alert: 'Above 80% of the career limit. Contact your flight surgeon now.',
  },
  sleep: {
    watch: 'Keep a fixed sleep window and dim lights an hour before. If sleep stays low for 3 more days, send a report to the flight surgeon.',
    alert: 'Very short sleep affects safety. Tell the crew and contact your flight surgeon.',
  },
  mood: {
    watch: 'Talk with the crew or call home. If low mood continues for several days, contact your flight surgeon.',
    alert: 'Contact your flight surgeon or behavioral health support today.',
  },
  heart: {
    watch: 'Rest, drink water and re-check when calm. Chest pain or fainting: contact your flight surgeon now.',
    alert: 'Contact your flight surgeon now.',
  },
  bp: {
    watch: 'Sit quietly for 5 minutes and measure again. If still outside range, send a report.',
    alert: 'Contact your flight surgeon now.',
  },
  temp: {
    watch: 'Measure again after 15 minutes and rest. Report it if it persists.',
    alert: 'Contact your flight surgeon now.',
  },
  glucose: {
    watch: 'Measure again. If out of range twice, send a report.',
    alert: 'Contact your flight surgeon now.',
  },
  tension: {
    watch: 'Take a short break. If tension continues, tell the flight surgeon or behavioral health support.',
    alert: 'Contact behavioral health support today.',
  },
  meals: {
    watch: 'Try small, regular meals and extra fluids. Tell the flight surgeon if low appetite continues.',
    alert: 'Contact your flight surgeon.',
  },
  exercise: {
    watch: 'Add a short session today to protect muscles and bones.',
    alert: 'Add a short session today.',
  },
  symptoms: {
    watch: 'Note when each symptom started and add details to the report note.',
    alert: 'Nausea or vomiting: contact your flight surgeon now.',
  },
};

export const rulesInfo = { source: 'built-in', version: 0 };

function apply(data: any, source: string) {
  if (!data || typeof data !== 'object') return;
  if (data.thresholds && typeof data.thresholds === 'object') {
    for (const k of Object.keys(RULES)) {
      if (typeof data.thresholds[k] === 'number') RULES[k] = data.thresholds[k];
    }
  }
  if (data.guidance && typeof data.guidance === 'object') {
    for (const id of Object.keys(data.guidance)) {
      const g = data.guidance[id];
      if (g && typeof g.watch === 'string' && typeof g.alert === 'string') {
        GUIDANCE[id] = { watch: g.watch, alert: g.alert };
      }
    }
  }
  rulesInfo.source = source;
  rulesInfo.version = typeof data.version === 'number' ? data.version : 0;
}

export async function loadRules(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (raw) apply(JSON.parse(raw), 'cached');
  } catch {
    // ignore a broken cache and keep the built-in defaults
  }
  if (!API) return;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(`${API}/rules`, { signal: controller.signal });
    if (!res.ok) return;
    const data = await res.json();
    apply(data, 'server');
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // link down: keep whatever is loaded
  } finally {
    clearTimeout(timer);
  }
}

export function doseStatus(mSv: number): Status {
  if (mSv >= RULES.doseCareerMsv * RULES.doseActionFrac) return 'alert';
  if (mSv >= RULES.doseCareerMsv * RULES.doseWatchFrac) return 'watch';
  return 'nominal';
}