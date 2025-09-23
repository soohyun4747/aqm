import { supabaseClient } from '@/lib/supabase/client';
import { SetStateAction } from 'react';

export async function fetchLogin(
	email: string,
	password: string,
	setErr: (value: SetStateAction<string | null>) => void
) {
	try {
		const supabase = supabaseClient();

		console.log({email, password});
		

		const { data: signInData, error } =
			await supabase.auth.signInWithPassword({
				email,
				password,
			});

		console.log(error);
		
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

export async function logout() {
	const supabase = supabaseClient();
	const { error } = await supabase.auth.signOut();
	if (error) {
		console.error('로그아웃 실패:', error.message);
		return false;
	}
	// 필요 시 redirect
	window.location.href = '/';
	return true;
}
