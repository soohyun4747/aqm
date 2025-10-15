import { supabaseClient } from '@/lib/supabase/client';

export async function fetchSession() {
	try {
		const supabase = supabaseClient();
		const {
			data: { session },
		} = await supabase.auth.getSession();

		return session;
	} catch (error) {
		throw error
	}
}
