import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'reportQueue';

export type QueuedReport = {
  id: string;
  createdAt: string;
  sent: boolean;
  text: string;
};

export async function queueReport(text: string): Promise<number> {
  const raw = await AsyncStorage.getItem(KEY);
  const list: QueuedReport[] = raw ? JSON.parse(raw) : [];
  list.push({ id: String(Date.now()), createdAt: new Date().toISOString(), sent: false, text });
  await AsyncStorage.setItem(KEY, JSON.stringify(list));
  return list.filter((r) => !r.sent).length;
}