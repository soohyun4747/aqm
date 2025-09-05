'use client';

import { ButtonLg } from '@/components/buttons/ButtonLg';
import { Card } from '@/components/Card';
import { Checkbox } from '@/components/Checkbox';
import { InputBox } from '@/components/InputBox';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Company, useUserStore } from '@/stores/userStore';

export default function LoginPage() {
	const router = useRouter();

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [rememberMeChecked, setRememberMeChecked] = useState(false);
	const [loading, setLoading] = useState(false);
	const [err, setErr] = useState<string | null>(null);

	const setUser = useUserStore((state) => state.setUser);

	// 필요한 순간에 storage를 다르게 써서 "remember me" 구현
	const getSupabase = () =>
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

	const handleLogin = async () => {
		setLoading(true);
		setErr(null);

		try {
			const supabase = getSupabase();

			// 1) 로그인
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
				setErr('로그인에 실패했습니다. 다시 시도해주세요.');
				return;
			}

			// 2) 프로필 조회 (role, company_id)
			const { data: profile, error: pErr } = await supabase
				.from('profiles')
				.select('role, company_id')
				.eq('user_id', authUser.id)
				.single();
			if (pErr || !profile) {
				setErr('프로필을 불러오지 못했습니다.');
				return;
			}

			// 3) company 레코드(회사 계정일 때만)
			let company: Company | null = null;
			if (profile.role === 'company' && profile.company_id) {
				const { data: c, error: cErr } = await supabase
					.from('companies')
					.select('id, name, phone, email, address, floor_image_path')
					.eq('id', profile.company_id)
					.single();

				if (cErr) {
					console.error('회사 데이터 로딩 실패:', cErr.message);
				} else if (c) {
					company = {
						id: c.id,
						name: c.name,
						phone: c.phone ?? undefined,
						email: c.email ?? undefined,
						address: c.address ?? undefined,
						floorImagePath: c.floor_image_path ?? undefined,
					};
				}
			}

			// 4) User 상태 저장 (company 포함)
			setUser({
				id: authUser.id,
				userType: profile.role, // 'admin' | 'company'
				company, // admin이면 null
			});

			// 5) 이동
			router.push('/');
		} catch (e: any) {
			setErr(e?.message ?? '로그인 중 오류가 발생했습니다.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='p-6 flex gap-6 min-h-screen max-h-screen items-center overflow-hidden relative'>
			<div className='flex items-center justify-center h-full flex-1 flex-col gap-6'>
				<Image
					src={'/logo.svg'}
					alt={'logo'}
					height={36}
					width={202.28}
				/>
				<Card
					className='w-full md:w-[unset]'
					content={
						<div className='flex flex-col gap-[56px]'>
							<div className='flex flex-col gap-4 self-stretch'>
								<p className='text-black heading-xl'>LOGIN</p>
								<p className='text-[#6E6E6E] body-lg-regular'>
									안녕하세요, 반갑습니다!{' '}
									<br className='md:hidden' />
									로그인을 진행해주세요.
								</p>
							</div>

							<div className='flex flex-col gap-4 self-stretch'>
								<InputBox
									label='이메일'
									inputAttr={{
										value: email,
										onChange: (e) =>
											setEmail(e.target.value),
										placeholder: '이메일을 입력해주세요.',
										type: 'email',
										autoComplete: 'email',
									}}
								/>
								<InputBox
									label='비밀번호'
									inputAttr={{
										value: password,
										onChange: (e) =>
											setPassword(e.target.value),
										placeholder: '비밀번호를 입력해주세요.',
										type: 'password',
										autoComplete: 'current-password',
									}}
								/>
								<Checkbox
									label={'Remember me'}
									checked={rememberMeChecked}
									onClick={() =>
										setRememberMeChecked(!rememberMeChecked)
									}
								/>
								{err && (
									<p className='text-red-500 body-sm-regular'>
										{err}
									</p>
								)}
							</div>

							<ButtonLg
								style={{ width: '100%' }}
								onClick={handleLogin}
								disabled={loading}>
								{loading ? '로그인 중…' : '로그인'}
							</ButtonLg>
						</div>
					}
				/>
			</div>

			<Image
				src={'/login-bg.png'}
				alt={'login-bg'}
				height={900}
				width={900}
				className='md:relative md:h-full md:w-[50%] md:opacity-100 absolute top-[-10%] left-0 z-[-1] opacity-50 h-[120%]'
			/>
		</div>
	);
}
