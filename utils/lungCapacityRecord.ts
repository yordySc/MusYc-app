import AsyncStorage from '@react-native-async-storage/async-storage';

const LUNG_CAPACITY_KEY = 'lungCapacity:bestRecord';
const LUNG_CAPACITY_LISTENERS: Set<(record: number) => void> = new Set();

export const getBestLungCapacityRecord = async (userId?: string): Promise<number> => {
  try {
    if (!userId) return 0;
    const key = `${LUNG_CAPACITY_KEY}:${userId}`;
    const stored = await AsyncStorage.getItem(key);
    return stored ? parseFloat(stored) : 0;
  } catch (error) {
    // Error reading lung capacity record
    return 0;
  }
};

export const setBestLungCapacityRecord = async (userId: string, record: number): Promise<void> => {
  try {
    const key = `${LUNG_CAPACITY_KEY}:${userId}`;
    const current = await getBestLungCapacityRecord(userId);
    
    // Solo guardar si es mejor que el anterior
    if (record > current) {
      await AsyncStorage.setItem(key, record.toString());
      notifyListeners(record);
    }
  } catch (error) {
    // Error setting lung capacity record
  }
};

const notifyListeners = (record: number) => {
  LUNG_CAPACITY_LISTENERS.forEach(listener => listener(record));
};

export const subscribeLungCapacityRecord = (callback: (record: number) => void): (() => void) => {
  LUNG_CAPACITY_LISTENERS.add(callback);
  return () => {
    LUNG_CAPACITY_LISTENERS.delete(callback);
  };
};
