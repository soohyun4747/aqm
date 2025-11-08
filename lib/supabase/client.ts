// // lib/supabase/client.ts
// 'use client';
// import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// type Mode = 'local' | 'session';

// const g = globalThis as unknown as {
//   __sb_local?: SupabaseClient;
//   __sb_session?: SupabaseClient;
// };

// function getMode(explicit?: boolean): Mode {
//   if (typeof window === 'undefined') return 'local';
//   if (explicit === true) return 'local';
//   if (explicit === false) return 'session';
//   // 마지막 선택값 기억(없으면 local)
//   const saved = window.localStorage.getItem('auth_storage');
//   return (saved === 'session' ? 'session' : 'local') as Mode;
// }

// export function supabaseClient(rememberMeChecked?: boolean) {
//   if (typeof window === 'undefined') throw new Error('browser only');

//   const mode = getMode(rememberMeChecked);
//   const key = mode === 'local' ? '__sb_local' : '__sb_session';

//   if (g[key]) return g[key] as SupabaseClient;

//   const storage = mode === 'local' ? window.localStorage : window.sessionStorage;

//   g[key] = createClient(URL, ANON, {
//     auth: {
//       persistSession: true,
//       autoRefreshToken: true,
//       storage,          // ✅ 모드별 storage 주입
//     },
//   });

//   return g[key]!;
// }

// lib/supabase/client.ts
'use client';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

type Mode = 'local' | 'session';

const g = globalThis as unknown as {
  __sb_local?: SupabaseClient;
  __sb_session?: SupabaseClient;
};

function getProjectRef(url: string): string {
  // https://{ref}.supabase.co
  try {
    const u = new URL(url);
    const host = u.hostname; // {ref}.supabase.co
    return host.split('.')[0]; // {ref}
  } catch {
    return '';
  }
}

const AUTH_KEY = (() => {
  const ref = getProjectRef(SUPABASE_URL);
  // supabase-js v2 기본 키 형태: sb-${ref}-auth-token
  return ref ? `sb-${ref}-auth-token` : 'sb-auth-token';
})();

function hasSession(storage: Storage, key: string): boolean {
  try {
    const raw = storage.getItem(key);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    // 기본적으로 { currentSession, expiresAt, ... } 형태
    return Boolean(parsed?.currentSession?.access_token);
  } catch {
    return false;
  }
}

function detectExistingMode(): Mode | null {
  const localHas = hasSession(window.localStorage, AUTH_KEY);
  const sessHas = hasSession(window.sessionStorage, AUTH_KEY);
  if (localHas) return 'local';
  if (sessHas) return 'session';
  return null;
}

function savePreferredMode(mode: Mode) {
  try {
    window.localStorage.setItem('auth_storage', mode);
  } catch {}
}

function readPreferredMode(): Mode | null {
  try {
    const v = window.localStorage.getItem('auth_storage');
    return v === 'session' ? 'session' : v === 'local' ? 'local' : null;
  } catch {
    return null;
  }
}

/** 선택적으로 세션을 다른 스토리지로 복사(remember 토글 시 유용) */
function migrateSession(src: Storage, dst: Storage, key: string) {
  const value = src.getItem(key);
  if (!value) return;
  try {
    dst.setItem(key, value);
    // 원본을 지울지 여부는 선택. 여기선 "이동"보단 "복사"만 수행.
    // src.removeItem(key);
  } catch {}
}

export function supabaseClient(rememberMeChecked?: boolean) {
  if (typeof window === 'undefined') throw new Error('browser only');

  // 1) 이미 존재하는 세션이 있으면 그 스토리지를 우선 사용
  let mode: Mode | null = detectExistingMode();

  // 2) 없다면, 과거에 선택한 모드(기억) 사용
  if (!mode) mode = readPreferredMode();

  // 3) 그래도 없으면, 이번에 전달된 rememberMeChecked로 결정
  if (!mode) {
    mode = rememberMeChecked === false ? 'session' : 'local';
  }

  // 4) 만약 rememberMeChecked가 명시되었고, 현재 모드와 다르면 세션을 복사(선택)
  if (rememberMeChecked !== undefined) {
    const want: Mode = rememberMeChecked ? 'local' : 'session';
    if (want !== mode) {
      if (mode === 'local' && hasSession(window.localStorage, AUTH_KEY)) {
        migrateSession(window.localStorage, window.sessionStorage, AUTH_KEY);
      } else if (mode === 'session' && hasSession(window.sessionStorage, AUTH_KEY)) {
        migrateSession(window.sessionStorage, window.localStorage, AUTH_KEY);
      }
      mode = want; // 이후부터는 원하는 모드 사용
    }
  }

  // 5) 전역 캐시에서 꺼내기
  const key = mode === 'local' ? '__sb_local' : '__sb_session';
  if (g[key]) return g[key]!;

  // 6) 클라이언트 생성
  const storage = mode === 'local' ? window.localStorage : window.sessionStorage;
  const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage,
      // storageKey: AUTH_KEY, // 보통 기본값이 동일하므로 생략 가능. 명시하고 싶으면 주석 해제
    },
  });

  g[key] = sb;
  savePreferredMode(mode);
  return sb;
}
