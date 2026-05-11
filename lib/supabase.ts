import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

export const SUPABASE_URL = 'https://eoogmrwzzrhwxtctyxer.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvb2dtcnd6enJod3h0Y3R5eGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NTI3NzMsImV4cCI6MjA5MjQyODc3M30.pWMGq7XSetuRqjl8Qh2d2Inhjp20L_x7ZIjt6vVMoXk';

// expo-secure-store adapter — iOS Keychain / Android Keystore
// @react-native-async-storage/async-storage must NOT be installed;
// otherwise supabase-js auto-detects it and overrides this adapter.
const CHUNK_SIZE = 2000;

const SecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    const countStr = await SecureStore.getItemAsync(`${key}_chunk_count`);
    if (!countStr) {
      return await SecureStore.getItemAsync(key);
    }
    const count = parseInt(countStr, 10);
    let value = '';
    for (let i = 0; i < count; i++) {
      const chunk = await SecureStore.getItemAsync(`${key}_${i}`);
      if (chunk) value += chunk;
    }
    return value;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (value.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value);
      await SecureStore.deleteItemAsync(`${key}_chunk_count`);
      return;
    }
    const chunks = Math.ceil(value.length / CHUNK_SIZE);
    await SecureStore.setItemAsync(`${key}_chunk_count`, chunks.toString());
    for (let i = 0; i < chunks; i++) {
      const chunk = value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      await SecureStore.setItemAsync(`${key}_${i}`, chunk);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    const countStr = await SecureStore.getItemAsync(`${key}_chunk_count`);
    if (countStr) {
      const count = parseInt(countStr, 10);
      for (let i = 0; i < count; i++) {
        await SecureStore.deleteItemAsync(`${key}_${i}`);
      }
      await SecureStore.deleteItemAsync(`${key}_chunk_count`);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: SecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
