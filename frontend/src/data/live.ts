import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Answers } from './checkin';

export type SavedCheckin = { id: string; savedAt: string; synced: boolean; answers: Answers };

export async function getSavedCheckins(): Promise<SavedCheckin[]> {
  const raw = await AsyncStorage.getItem('checkins');
  const list: SavedCheckin[] = raw ? JSON.parse(raw) : [];
  return list.sort((a, b) => a.savedAt.localeCompare(b.savedAt));
}

export function num(value: string | null | undefined): number | null {
  if (value == null || value.trim() === '') return null;
  const n = parseFloat(value.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}