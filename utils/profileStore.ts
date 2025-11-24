import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const KEY_PREFIX = 'musyc_profile_instruments';

// Try remote (Supabase) first when userId is provided, otherwise fallback to local AsyncStorage.
export async function getInstruments(userId?: string): Promise<string[]> {
  const key = userId ? `${KEY_PREFIX}_${userId}` : KEY_PREFIX;

  if (userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('instruments')
        .eq('id', userId)
        .single();

      if (!error && data) {
        const inst = data.instruments ?? [];
        await AsyncStorage.setItem(key, JSON.stringify(inst));
        return inst as string[];
      }
    } catch (err) {
      console.warn('Supabase getInstruments failed, falling back to local', err);
    }
  }

  // Fallback to local cache
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch (err) {
    console.warn('getInstruments error', err);
    return [];
  }
}

export async function setInstruments(list: string[], userId?: string): Promise<void> {
  const key = userId ? `${KEY_PREFIX}_${userId}` : KEY_PREFIX;

  // Save local cache first
  try {
    await AsyncStorage.setItem(key, JSON.stringify(list));
  } catch (err) {
    console.warn('setInstruments local save error', err);
  }

  if (!userId) return;

  // Try to upsert remote profile instruments
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: userId, instruments: list, updated_at: new Date().toISOString() }, { returning: 'representation' })
      .select();

    if (error) {
      console.warn('Supabase setInstruments upsert error', error);
    }
  } catch (err) {
    console.warn('Supabase setInstruments exception', err);
  }
}

export async function getProfile(userId?: string) {
  if (!userId) return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, instruments, principal_instrument, is_dark_mode, username, updated_at')
      .eq('id', userId)
      .single();
    if (error) {
      console.warn('getProfile supabase error', error);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('getProfile exception', err);
    return null;
  }
}

export async function setProfile(profile: { id: string; instruments?: string[]; principal_instrument?: string | null; is_dark_mode?: boolean; username?: string | null }) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ ...profile, updated_at: new Date().toISOString() }, { returning: 'representation' })
      .select();
    if (error) console.warn('setProfile supabase error', error);
    return data;
  } catch (err) {
    console.warn('setProfile exception', err);
    throw err;
  }
}
