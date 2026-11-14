import AsyncStorage from '@react-native-async-storage/async-storage';

const API = process.env.EXPO_PUBLIC_API_URL;
const ASTRONAUT_ID = 'demo'; // replace once there is a login or profile

type Item = { id: string; [key: string]: unknown };

// key = AsyncStorage key, path = backend collection, flag = field that marks "already sent"
const targets = [
  { key: 'checkins', path: 'checkins', flag: 'synced' },
  { key: 'readings', path: 'readings', flag: 'synced' },
  { key: 'reportQueue', path: 'reports', flag: 'sent' },
];

async function readList(key: string): Promise<Item[]> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

async function post(path: string, items: Item[]): Promise<string[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${API}/sync/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ astronaut_id: ASTRONAUT_ID, items }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.accepted ?? [];
  } finally {
    clearTimeout(timer);
  }
}

export async function pendingCount(): Promise<number> {
  let total = 0;
  for (const t of targets) {
    total += (await readList(t.key)).filter((i) => !i[t.flag]).length;
  }
  return total;
}

let running = false;

export async function syncAll(): Promise<{ sent: number; failed: boolean }> {
  if (running || !API) return { sent: 0, failed: !API };
  running = true;
  let sent = 0;
  let failed = false;
  try {
    for (const t of targets) {
      const pending = (await readList(t.key)).filter((i) => !i[t.flag]);
      if (pending.length === 0) continue;
      try {
        const accepted = await post(t.path, pending);
        // re-read so anything saved during the request is kept
        const latest = await readList(t.key);
        const updated = latest.map((i) => (accepted.includes(i.id) ? { ...i, [t.flag]: true } : i));
        await AsyncStorage.setItem(t.key, JSON.stringify(updated));
        sent += accepted.length;
      } catch {
        failed = true; // link down: leave everything queued, try again later
      }
    }
  } finally {
    running = false;
  }
  return { sent, failed };
}