// lib/supabase/client.ts
'use client';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

type Mode = 'local' | 'session';

const g = globalThis as unknown as {
  __sb_local?: SupabaseClient;
  __sb_session?: SupabaseClient;
};

function getMode(explicit?: boolean): Mode {
  if (typeof window === 'undefined') return 'local';
  if (explicit === true) return 'local';
  if (explicit === false) return 'session';
  // 마지막 선택값 기억(없으면 local)
  const saved = window.localStorage.getItem('auth_storage');
  return (saved === 'session' ? 'session' : 'local') as Mode;
}

export function supabaseClient(rememberMeChecked?: boolean) {
  if (typeof window === 'undefined') throw new Error('browser only');

  const mode = getMode(rememberMeChecked);
  const key = mode === 'local' ? '__sb_local' : '__sb_session';

  if (g[key]) return g[key] as SupabaseClient;

  const storage = mode === 'local' ? window.localStorage : window.sessionStorage;

  g[key] = createClient(URL, ANON, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage,          // ✅ 모드별 storage 주입
    },
  });

  return g[key]!;
}
