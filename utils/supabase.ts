// utils/supabase.ts
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wcitoewmzhvlnhmykbks.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjaXRvZXdtemh2bG5obXlrYmtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4ODExOTQsImV4cCI6MjA3OTQ1NzE5NH0.f8Ytt4O6QbBGReMVEtBTqM5Kito_nSoxCtLTlWbrBmA';

// Adaptador perfecto para que funcione en web y móvil
const supabaseStorageAdapter = {
  getItem: async (key: string) => {
    return await AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    await AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    await AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: supabaseStorageAdapter as any, // ← el "as any" es necesario por tipos
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});