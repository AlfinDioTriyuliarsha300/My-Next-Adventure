import { AppState, Platform } from 'react-native';

import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL;

const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    'EXPO_PUBLIC_SUPABASE_URL belum tersedia'
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    'EXPO_PUBLIC_SUPABASE_ANON_KEY belum tersedia'
  );
}

/**
 * Storage untuk React Native dan Web.
 *
 * Native:
 *   menggunakan AsyncStorage
 *
 * Web:
 *   menggunakan localStorage
 *
 * SSR:
 *   tidak mengakses window/localStorage
 *   karena window belum tersedia.
 */
const ssrSafeWebStorage = {
  getItem: async (key: string) => {
    if (typeof window === 'undefined') {
      return null;
    }

    return window.localStorage.getItem(key);
  },

  setItem: async (
    key: string,
    value: string
  ) => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(key, value);
  },

  removeItem: async (key: string) => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.removeItem(key);
  },
};

const storage =
  Platform.OS === 'web'
    ? ssrSafeWebStorage
    : AsyncStorage;

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

/**
 * Auto refresh session hanya dijalankan
 * ketika aplikasi Native aktif.
 */
if (Platform.OS !== 'web') {
  AppState.addEventListener(
    'change',
    (state) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    }
  );
}