import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_PREFIX = 'musyc_best_score';

export async function getBestScore(userId?: string): Promise<number> {
  try {
    const key = userId ? `${KEY_PREFIX}_${userId}` : KEY_PREFIX;
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return 0;
    const n = parseInt(raw, 10);
    return Number.isNaN(n) ? 0 : n;
  } catch (err) {
    // getBestScore error
    return 0;
  }
}

export async function setBestScore(score: number, userId?: string): Promise<void> {
  try {
    const key = userId ? `${KEY_PREFIX}_${userId}` : KEY_PREFIX;
    await AsyncStorage.setItem(key, String(Math.max(0, Math.floor(score))));
    // notify subscribers
    try {
      notifySubscribers(userId, Math.max(0, Math.floor(score)));
    } catch (e) {
      // ignore
    }
  } catch (err) {
    // setBestScore error
  }
}

type Subscriber = (userId: string | undefined, score: number) => void;
const subscribers: Subscriber[] = [];

function notifySubscribers(userId: string | undefined, score: number) {
  subscribers.forEach(s => {
    try { s(userId, score); } catch (e) { /* ignore listener errors */ }
  });
}

export function subscribeBestScore(cb: Subscriber) {
  subscribers.push(cb);
  return () => {
    const idx = subscribers.indexOf(cb);
    if (idx >= 0) subscribers.splice(idx, 1);
  };
}
