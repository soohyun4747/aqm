'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase/client';
import { Button } from '@/src/components/buttons/Button';
import Image from 'next/image';

export default function ResetPasswordPage() {
	const sp = useSearchParams();
	const router = useRouter();
	const code = sp?.get('code');
	const supabase = useMemo(() => {
		try {
			const sb = supabaseClient();
			return sb;
		} catch (error) {
			return null;
		}
	}, []); // 서버에서는 null
	const [ready, setReady] = useState(false);

	const [exchanging, setExchanging] = useState<boolean>(!!code);
	const [exchangeError, setExchangeError] = useState<string | null>(null);

	const [pw, setPw] = useState('');
	const [pw2, setPw2] = useState('');
	const [saving, setSaving] = useState(false);
	const [done, setDone] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [autoMsg, setAutoMsg] = useState<string>('');

	// 마운트 이후에만 진행
	useEffect(() => {
		if (supabase) {
			setReady(!!supabase); // 브라우저에서만 true
		} else {
			router.replace('/');
			return;
		}
	}, [supabase]);

	// A) PKCE (?code=) 처리
	useEffect(() => {
		if (!ready || !supabase) return;
		let mounted = true;
		(async () => {
			if (!code) return;
			setExchanging(true);
			setExchangeError(null);
			const { error } = await supabase.auth.exchangeCodeForSession(code);
			if (!mounted) return;
			if (error)
				setExchangeError(
					error.message || '인증 코드 교환에 실패했습니다.'
				);
			setExchanging(false);
		})();
		return () => {
			mounted = false;
		};
	}, [ready, code, supabase]);

	// B) 해시 (#access_token=...) 처리
	useEffect(() => {
		if (!ready || !supabase) return;
		if (code) return; // PKCE 우선
		const hash = window.location.hash; // "#access_token=...&..."
		if (!hash?.startsWith('#')) return;

		const params = new URLSearchParams(hash.slice(1));
		const type = params.get('type');
		const access_token = params.get('access_token');
		const refresh_token = params.get('refresh_token');

		if (type === 'recovery' && access_token && refresh_token) {
			(async () => {
				const { error } = await supabase.auth.setSession({
					access_token,
					refresh_token,
				});
				if (error) {
					setExchangeError(
						error.message || '세션 설정에 실패했습니다.'
					);
				} else {
					// URL 해시 제거
					history.replaceState(null, '', window.location.pathname);
				}
			})();
		}
	}, [ready, code, supabase]);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);

		if (!pw || pw.length < 8) {
			setError('비밀번호는 8자 이상이어야 합니다.');
			return;
		}
		if (pw !== pw2) {
			setError('비밀번호가 서로 일치하지 않습니다.');
			return;
		}

		setSaving(true);
		const data = await supabase?.auth.updateUser({ password: pw });
		setSaving(false);

		if (data?.error) {
			setError(data?.error.message || '비밀번호 변경에 실패했습니다.');
			return;
		}

		setDone(true);
		setAutoMsg(
			'비밀번호가 변경되었습니다. 3초 후 로그인 페이지로 이동합니다…'
		);
		setTimeout(() => router.replace('/'), 3000);
	}

	return (
		<main className='mx-auto max-w-lg px-4 py-10 flex flex-col gap-6'>
			<div className='flex justify-between px-2'>
				<Image
					src={'/logo.svg'}
					alt={'logo'}
					width={157.33}
					height={28}
				/>
				<p className='mt-1 body-md text-Gray-600'>CNCbiotech Inc.</p>
			</div>
			<div className='rounded-2xl border border-Gray-200 bg-White shadow-sm'>
				{/* 헤더 */}
				<div className='border-b border-Gray-200 px-6 py-5'>
					<h1 className='heading-md text-Gray-900'>비밀번호 설정</h1>
					<p className='mt-1 body-md text-Gray-600'>
						이메일로 받은 링크를 통해 비밀번호를 새로 설정해 주세요.
					</p>
				</div>

				{/* 콘텐츠 */}
				<div className='px-6 py-6'>
					{exchanging && (
						<div className='rounded-lg border border-Gray-200 bg-Gray-50 px-4 py-3 body-md text-Gray-700'>
							링크 확인 중입니다…
						</div>
					)}

					{!exchanging && exchangeError && (
						<div className='rounded-lg border border-red-200 bg-red-50 px-4 py-3'>
							<p className='body-md text-red-700'>
								{exchangeError}
							</p>
							<p className='mt-1 body-sm text-Gray-600'>
								최신 이메일 링크로 다시 시도해 주세요.
							</p>
						</div>
					)}

					{!exchanging && !exchangeError && !done && (
						<form
							onSubmit={onSubmit}
							className='mt-1 space-y-5'>
							<div>
								<label className='body-sm-md text-Gray-700'>
									새 비밀번호
								</label>
								<input
									type='password'
									value={pw}
									onChange={(e) => setPw(e.target.value)}
									className='mt-2 block w-full rounded-xl border border-Gray-300 bg-White px-3 py-2 body-md text-Gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'
									placeholder='8자 이상'
									autoComplete='new-password'
								/>
							</div>

							<div>
								<label className='body-sm-md text-Gray-700'>
									새 비밀번호 확인
								</label>
								<input
									type='password'
									value={pw2}
									onChange={(e) => setPw2(e.target.value)}
									className='mt-2 block w-full rounded-xl border border-Gray-300 bg-White px-3 py-2 body-md text-Gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'
									autoComplete='new-password'
								/>
							</div>

							<div className='flex justify-between items-center'>
								<>
									{error && (
										<p className='body-sm text-Red-600'>
											{error}
										</p>
									)}
								</>

								<Button
									type='submit'
									disabled={saving}>
									{saving ? '변경 중…' : '비밀번호 설정'}
								</Button>
							</div>
						</form>
					)}

					{done && (
						<div className='rounded-lg border border-green-200 bg-green-50 px-4 py-3'>
							<p className='body-md text-green-700'>{autoMsg}</p>
							<div className='mt-2 body-sm text-Gray-600'>
								바로 이동하려면{' '}
								<button
									className='underline underline-offset-2 hover:opacity-80'
									onClick={() => router.replace('/')}>
									로그인 페이지로 가기
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</main>
	);
}
