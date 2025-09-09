// lib/supabase/client.ts (클라이언트 전용)
import { createClient } from '@supabase/supabase-js';

export const supabaseClient = (rememberMeChecked?: boolean) =>
	createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			auth: {
				persistSession: true,
				storage:
					typeof window === 'undefined'
						? undefined
						: rememberMeChecked
						? window.localStorage
						: window.sessionStorage,
			},
		}
	);
