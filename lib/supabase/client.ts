// lib/supabase/client.ts
'use client';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const g = globalThis as unknown as { __sb?: SupabaseClient };

export function supabaseClient(rememberMeChecked?: boolean) {
  if (g.__sb) return g.__sb;
  if (typeof window === 'undefined') throw new Error('browser only');

  const storage =
    rememberMeChecked === true ? window.localStorage : window.sessionStorage;

  g.__sb = createClient(URL, ANON, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage,            // ✅ storageKey 지정 안 함(기본값 사용)
      // storageKey: 제거!
    },
  });
  return g.__sb;
}
