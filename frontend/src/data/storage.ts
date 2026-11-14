import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Answers } from './checkin';
import type { Reading } from './radiation';

const KEY = 'checkins';

export type SavedCheckin = {
  id: string;
  savedAt: string;
  synced: boolean;
  answers: Answers;
};

export async function saveCheckin(answers: Answers): Promise<number> {
  const raw = await AsyncStorage.getItem(KEY);
  const list: SavedCheckin[] = raw ? JSON.parse(raw) : [];
  list.push({ id: String(Date.now()), savedAt: new Date().toISOString(), synced: false, answers });
  await AsyncStorage.setItem(KEY, JSON.stringify(list));
  return list.length;
}

const READINGS_KEY = 'readings';

export type SavedReading = {
  id: string;
  savedAt: string;
  synced: boolean;
  reading: Reading;
};

export async function loadReadings(): Promise<SavedReading[]> {
  const raw = await AsyncStorage.getItem(READINGS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveReading(reading: Reading): Promise<number> {
  const list = await loadReadings();
  list.push({ id: String(Date.now()), savedAt: new Date().toISOString(), synced: false, reading });
  await AsyncStorage.setItem(READINGS_KEY, JSON.stringify(list));
  return list.length;
}