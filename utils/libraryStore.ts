import AsyncStorage from '@react-native-async-storage/async-storage';

export type Level = 'Principiante' | 'Intermedio' | 'Avanzado';

export type RepertoireItem = {
  id: string;
  title: string;
  type: string;
  instrument: string;
  level: Level;
  owner?: string; // 'system' or userId
  public?: boolean; // for user uploads
  fileUri?: string | null; // local uri or remote
  created_at?: string;
};

const REPO_KEY = 'musyc_repertoire';
const USER_UPLOADS_KEY = (id?: string) => `musyc_user_uploads_${id ?? 'anon'}`;

function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function getRepertoire(): Promise<RepertoireItem[]> {
  try {
    const raw = await AsyncStorage.getItem(REPO_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RepertoireItem[];
  } catch (err) {
    console.warn('getRepertoire error', err);
    return [];
  }
}

export async function addRepertoireItem(item: Omit<RepertoireItem, 'id' | 'created_at'>) {
  try {
    const list = await getRepertoire();
    const next: RepertoireItem = { ...item, id: makeId(), created_at: new Date().toISOString() };
    const updated = [next, ...list];
    await AsyncStorage.setItem(REPO_KEY, JSON.stringify(updated));
    return next;
  } catch (err) {
    console.warn('addRepertoireItem error', err);
    throw err;
  }
}

export async function getUserUploads(userId?: string): Promise<RepertoireItem[]> {
  try {
    const raw = await AsyncStorage.getItem(USER_UPLOADS_KEY(userId));
    if (!raw) return [];
    return JSON.parse(raw) as RepertoireItem[];
  } catch (err) {
    console.warn('getUserUploads error', err);
    return [];
  }
}

export async function addUserUpload(userId: string | undefined, item: Omit<RepertoireItem, 'id' | 'created_at' | 'owner'>) {
  try {
    const key = USER_UPLOADS_KEY(userId);
    const existing = await getUserUploads(userId);
    const next: RepertoireItem = { ...item, id: makeId(), owner: userId ?? 'anon', created_at: new Date().toISOString() };
    const updated = [next, ...existing];
    await AsyncStorage.setItem(key, JSON.stringify(updated));
    return next;
  } catch (err) {
    console.warn('addUserUpload error', err);
    throw err;
  }
}

export async function togglePublish(userId: string | undefined, uploadId: string, makePublic: boolean) {
  try {
    const uploads = await getUserUploads(userId);
    const updated = uploads.map(u => (u.id === uploadId ? { ...u, public: makePublic } : u));
    await AsyncStorage.setItem(USER_UPLOADS_KEY(userId), JSON.stringify(updated));
    return updated.find(u => u.id === uploadId) || null;
  } catch (err) {
    console.warn('togglePublish error', err);
    throw err;
  }
}
