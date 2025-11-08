'use client';

import { ButtonLg } from '@/src/components/buttons/ButtonLg';
import { Card } from '@/src/components/Card';
import { Checkbox } from '@/src/components/Checkbox';
import { InputBox } from '@/src/components/InputBox';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { IAdminContact, ICompany, useUserStore } from '@/src/stores/userStore';
import { fetchLogin } from '@/src/utils/supabase/login';
import { fetchProfileWithId } from '@/src/utils/supabase/profile';
import { fetchCompanyWithCompanyId } from '@/src/utils/supabase/company';
import { useSelectedCompanyStore } from '../stores/selectedCompanyStore';
import { fetchAdminContactByUserId } from '../utils/supabase/adminContacts';

export default function LoginPage() {
	const router = useRouter();

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [rememberMeChecked, setRememberMeChecked] = useState(false);
	const [loading, setLoading] = useState(false);
	const [err, setErr] = useState<string | null>(null);

	const setUser = useUserStore((state) => state.setUser);
	const setCompany = useSelectedCompanyStore((state) => state.setCompany);

	const handleLogin = async () => {
		setLoading(true);
		setErr(null);

		try {
			// 1) 로그인
			const authUser = await fetchLogin(
				email,
				password,
				rememberMeChecked,
				setErr
			);			

			if (authUser) {
				// 2) 프로필 조회 (role, company_id)
				const profile = await fetchProfileWithId(authUser.id, setErr);
				if (profile) {
					// 3) company 레코드(회사 계정일 때만)
					let company: undefined | ICompany = undefined;
                                        if (profile.role === 'company' && profile.company_id) {
                                                company = await fetchCompanyWithCompanyId(
                                                        profile.company_id
                                                );
                                        }

                                        let adminContact: IAdminContact | undefined;
                                        if (profile.role === 'admin') {
                                                try {
                                                        adminContact = await fetchAdminContactByUserId(
                                                                authUser.id
                                                        );
                                                } catch (error) {
                                                        console.error(
                                                                'Failed to fetch admin contact info:',
                                                                error
                                                        );
                                                }
                                        }

                                        // 4) user 정보 저장
                                        setUser({
                                                id: authUser.id,
                                                userType: profile.role, // 'admin' | 'company'
                                                company, // admin이면 null
                                                adminContact,
                                        });

					// 5) 이동
					if (profile.role === 'admin') {
						router.push('/admin/calendar');
					} else {
						setCompany(company);
						router.push('/calendar');
					}
				}
			}
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
					src={`/logo.svg`}
					alt={'logo'}
					height={36}
					width={202.28}
				/>
				<Card className='w-full md:w-[unset]'>
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
									onChange: (e) => setEmail(e.target.value),
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
				</Card>
			</div>

			<Image
				src={'/login-bg.png'}
				alt={'login-bg'}
				height={900}
				width={900}
				className='md:relative md:h-[calc(100vh-48px)] md:w-[50%] md:opacity-100 absolute top-[-10%] left-0 z-[-1] opacity-50 h-[120%]'
			/>
		</div>
	);
}
