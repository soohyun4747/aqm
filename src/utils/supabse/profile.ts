import { supabaseClient } from '@/lib/supabase/client';
import { SetStateAction } from 'react';

export async function fetchProfileWithId(
	userId: string,
	setErr?: (value: SetStateAction<string | null>) => void
) {
	try {
		const supabase = supabaseClient();

		const { data: profile, error: pErr } = await supabase
			.from('profiles')
			.select('role, company_id')
			.eq('user_id', userId)
			.single();
		if (pErr || !profile) {
			if (setErr) {
				setErr('프로필을 불러오지 못했습니다.');
			}
			console.error(pErr);

			return;
		}

		return profile;
	} catch (error) {
		console.error(error);
	}
}
