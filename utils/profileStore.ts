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
      // Supabase getInstruments failed, falling back to local
    }
  }

  // Fallback to local cache
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch (err) {
    // getInstruments error
    return [];
  }
}

export async function setInstruments(list: string[], userId?: string): Promise<void> {
  const key = userId ? `${KEY_PREFIX}_${userId}` : KEY_PREFIX;

  // Save local cache first
  try {
    await AsyncStorage.setItem(key, JSON.stringify(list));
  } catch (err) {
    // setInstruments local save error
  }

  if (!userId) return;

  // Try to upsert remote profile instruments
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: userId, instruments: list, updated_at: new Date().toISOString() })
      .select();

    if (error) {
      // Supabase setInstruments upsert error
    }
  } catch (err) {
    // Supabase setInstruments exception
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
      // getProfile supabase error
      return null;
    }
    return data;
  } catch (err) {
    // getProfile exception
    return null;
  }
}

export async function setProfile(profile: { id: string; instruments?: string[]; principal_instrument?: string | null; is_dark_mode?: boolean; username?: string | null }) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ ...profile, updated_at: new Date().toISOString() })
      .select();
    if (error) {
      // setProfile supabase error
    }
    return data;
  } catch (err) {
    // setProfile exception
    throw err;
  }
}
