// lib/supabase/admin.ts (서버 전용)
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!; // 서버 전용 환경변수에 보관

// HMR 환경에서도 인스턴스 1개만 유지
let _admin: SupabaseClient | undefined;

/**
 * 서버 전용 Supabase Admin 클라이언트 (Service Role)
 * 싱글턴으로 관리
 */
export function supabaseAdmin(): SupabaseClient {
  if (_admin) return _admin;

  _admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return _admin;
}
