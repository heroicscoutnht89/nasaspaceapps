import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Answers } from './checkin';

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