'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';

import { supabaseClient } from '@/lib/supabase/client';
import { Card2 } from '@/src/components/Card2';
import { GNB } from '@/src/components/GNB';
import { InputBox } from '@/src/components/InputBox';
import { IconButton } from '@/src/components/IconButton';
import { Plus } from '@/src/components/icons/Plus';
import { Trashcan } from '@/src/components/icons/Trashcan';
import { Button } from '@/src/components/buttons/Button';
import { IToastMessage, ToastMessage } from '@/src/components/ToastMessage';
import { useUserStore } from '@/src/stores/userStore';
import {
	fetchAdminContactByUserId,
	upsertAdminContact,
} from '@/src/utils/supabase/adminContacts';

export default function AdminProfilePage() {
	const router = useRouter();
	const user = useUserStore((state) => state.user);
	const setUser = useUserStore((state) => state.setUser);

	const [emails, setEmails] = useState<string[]>(['']);
	const [phones, setPhones] = useState<string[]>(['']);
        const [saving, setSaving] = useState(false);
        const [passwordSaving, setPasswordSaving] = useState(false);
        const [newPassword, setNewPassword] = useState('');
        const [confirmPassword, setConfirmPassword] = useState('');
        const [toastMessage, setToastMessage] = useState<IToastMessage>();

	const isAdmin = user?.userType === 'admin';

	useEffect(() => {
		if (!user) return;

		if (!isAdmin) {
			router.replace('/');
			return;
		}

		if (user.adminContact) {
			setEmails(
				user.adminContact.emails.length
					? user.adminContact.emails
					: ['']
			);
			setPhones(
				user.adminContact.phones.length
					? user.adminContact.phones
					: ['']
			);
			return;
		}

		let ignore = false;
		(async () => {
			try {
				const info = await fetchAdminContactByUserId(user.id);
				if (ignore) return;

				setEmails(info.emails.length ? info.emails : ['']);
				setPhones(info.phones.length ? info.phones : ['']);
				setUser({ ...user, adminContact: info });
			} catch (error) {
				console.error('Failed to load admin contact info', error);
				if (ignore) return;
				setToastMessage({
					status: 'error',
					message: '관리자 연락처를 불러오지 못했습니다.',
				});
			}
		})();

		return () => {
			ignore = true;
		};
	}, [isAdmin, router, setUser, user]);

	const addEmailField = () => {
		setEmails((prev) => [...prev, '']);
	};

	const updateEmail = (idx: number, value: string) => {
		setEmails((prev) =>
			prev.map((email, i) => (i === idx ? value : email))
		);
	};

	const removeEmail = (idx: number) => {
		setEmails((prev) => {
			if (prev.length === 1) return [''];
			return prev.filter((_, i) => i !== idx);
		});
	};

	const addPhoneField = () => {
		setPhones((prev) => [...prev, '']);
	};

	const updatePhone = (idx: number, value: string) => {
		setPhones((prev) =>
			prev.map((phone, i) => (i === idx ? value : phone))
		);
	};

	const removePhone = (idx: number) => {
		setPhones((prev) => {
			if (prev.length === 1) return [''];
			return prev.filter((_, i) => i !== idx);
		});
	};

	const hasValidEmail = useMemo(
		() => emails.some((email) => email.trim().length > 0),
		[emails]
	);

	const hasValidPhone = useMemo(
		() => phones.some((phone) => phone.replace(/[^0-9+]/g, '').length > 0),
		[phones]
	);

        const handleSave = async () => {
                if (!user || !isAdmin) return;

		if (!hasValidEmail || !hasValidPhone) {
			setToastMessage({
				status: 'error',
				message: '이메일과 전화번호를 각각 1개 이상 입력해주세요.',
			});
			return;
		}

		try {
			setSaving(true);
			const saved = await upsertAdminContact(user.id, emails, phones);
			setEmails(saved.emails.length ? saved.emails : ['']);
			setPhones(saved.phones.length ? saved.phones : ['']);
			setUser({ ...user, adminContact: saved });
			setToastMessage({
				status: 'confirm',
				message: '관리자 연락처가 저장되었습니다.',
			});
		} catch (error: any) {
			console.error('Failed to save admin contact info', error);
			setToastMessage({
				status: 'error',
				message:
					error?.message ||
					'관리자 연락처 저장 중 오류가 발생했습니다.',
			});
		} finally {
			setSaving(false);
                }
        };

        const handleChangePassword = async () => {
                if (!newPassword.trim()) {
                        setToastMessage({
                                status: 'error',
                                message: '새 비밀번호를 입력해 주세요.',
                        });
                        return;
                }

                if (newPassword !== confirmPassword) {
                        setToastMessage({
                                status: 'error',
                                message: '비밀번호와 확인 비밀번호가 일치하지 않습니다.',
                        });
                        return;
                }

                try {
                        setPasswordSaving(true);
                        const supabase = supabaseClient();
                        const { error } = await supabase.auth.updateUser({
                                password: newPassword,
                        });
                        if (error) throw error;

                        setNewPassword('');
                        setConfirmPassword('');
                        setToastMessage({
                                status: 'confirm',
                                message: '비밀번호가 변경되었습니다.',
                        });
                } catch (error: any) {
                        console.error('change password error', error);
                        setToastMessage({
                                status: 'error',
                                message:
                                        error?.message ||
                                        '비밀번호 변경 중 오류가 발생했습니다.',
                        });
                } finally {
                        setPasswordSaving(false);
                }
        };

	return (
		<div className='flex flex-col bg-Gray-100 min-h-screen'>
			<GNB />
			<div className='flex justify-between items-center px-6 py-4 bg-white'>
				<p className='text-Gray-900 heading-md'>관리자 프로필</p>
			</div>

			<div className='p-6 flex flex-col gap-[20px]'>
                                <Card2>
                                        <div className='flex flex-col gap-6'>
						<div className='flex flex-col gap-3'>
							<div className='flex items-center justify-between'>
								<p className='text-Gray-900 body-lg-medium'>
									이메일 목록
								</p>
								{/* <IconButton
									icon={<Plus />}
									onClick={addEmailField}
								/> */}
							</div>
							<div className='flex flex-col gap-3'>
								{emails.map((email, idx) => (
									<div
										key={`email-${idx}`}
										className='flex gap-3 items-end'>
										<InputBox
											label={`이메일 ${idx + 1}`}
											inputAttr={{
												value: email,
												onChange: (e) =>
													updateEmail(
														idx,
														e.target.value
													),
												placeholder:
													'admin@example.com',
												type: 'email',
											}}
											style={{ flex: 1 }}
										/>
										<IconButton
											icon={<Trashcan />}
											onClick={() => removeEmail(idx)}
											disabled={emails.length === 1}
											style={{ paddingBottom: 8 }}
										/>
									</div>
								))}
							</div>
							<Button
								variant='alternative'
								className='w-fit '
								onClick={addEmailField}>
								<Plus /> 이메일 추가
							</Button>
						</div>

						<div className='flex flex-col gap-3'>
							<div className='flex items-center justify-between'>
								<p className='text-Gray-900 body-lg-medium'>
									전화번호 목록
								</p>
								{/* <IconButton
									icon={<Plus />}
									onClick={addPhoneField}
								/> */}
							</div>
							<div className='flex flex-col gap-3'>
								{phones.map((phone, idx) => (
									<div
										key={`phone-${idx}`}
										className='flex gap-3 items-end'>
										<InputBox
											label={`전화번호 ${idx + 1}`}
											inputAttr={{
												value: phone,
												onChange: (e) =>
													updatePhone(
														idx,
														e.target.value
													),
												placeholder: '01012345678',
											}}
											style={{ flex: 1 }}
										/>
										<IconButton
											icon={<Trashcan />}
											onClick={() => removePhone(idx)}
											disabled={phones.length === 1}
											style={{ paddingBottom: 8 }}
										/>
									</div>
								))}
							</div>

							<Button
								variant='alternative'
								className='w-fit '
								onClick={addPhoneField}>
								<Plus /> 번호 추가
							</Button>
						</div>
					</div>
                                </Card2>

                                <Card2>
                                        <div className='flex flex-col gap-6'>
                                                <p className='text-Gray-900 body-lg-medium'>비밀번호 변경</p>

                                                <div className='flex flex-col gap-4'>
                                                        <InputBox
                                                                label='새 비밀번호'
                                                                inputAttr={{
                                                                        value: newPassword,
                                                                        onChange: (e) =>
                                                                                setNewPassword(
                                                                                        e.target.value
                                                                                ),
                                                                        type: 'password',
                                                                        placeholder: '********',
                                                                        autoComplete: 'new-password',
                                                                }}
                                                                isMandatory
                                                        />
                                                        <InputBox
                                                                label='새 비밀번호 확인'
                                                                inputAttr={{
                                                                        value: confirmPassword,
                                                                        onChange: (e) =>
                                                                                setConfirmPassword(
                                                                                        e.target.value
                                                                                ),
                                                                        type: 'password',
                                                                        placeholder: '********',
                                                                        autoComplete: 'new-password',
                                                                }}
                                                                isMandatory
                                                        />
                                                </div>

                                                <div className='flex justify-end'>
                                                        <Button
                                                                onClick={handleChangePassword}
                                                                disabled={passwordSaving}>
                                                                {passwordSaving
                                                                        ? '변경 중…'
                                                                        : '변경하기'}
                                                        </Button>
                                                </div>
                                        </div>
                                </Card2>

                                <div className='flex justify-end'>
                                        <Button
						onClick={handleSave}
						disabled={saving}>
						{saving ? '저장 중…' : '저장'}
					</Button>
				</div>
			</div>

			{toastMessage && (
				<ToastMessage
					status={toastMessage.status}
					message={toastMessage.message}
					setToastMessage={setToastMessage}
				/>
			)}
		</div>
	);
}
