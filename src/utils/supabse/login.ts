import { supabaseClient } from '@/lib/supabase/client';
import { SetStateAction } from 'react';

export async function fetchLogin(
	email: string,
	password: string,
	setErr: (value: SetStateAction<string | null>) => void
) {
	try {
		const supabase = supabaseClient();

		const { data: signInData, error } =
			await supabase.auth.signInWithPassword({
				email,
				password,
			});
		if (error) {
			setErr(error.message);
			return;
		}
		const authUser = signInData.user;
		if (!authUser) {
			setErr('로그인에 실패하였습니다.');
			return;
		}

		return authUser;
	} catch (error) {
		setErr('로그인에 실패하였습니다.');
		console.error(error);
	}
}
