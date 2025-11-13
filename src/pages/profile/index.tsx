'use client';

import { supabaseClient } from '@/lib/supabase/client';
import { Card2 } from '@/src/components/Card2';
import { GNB } from '@/src/components/GNB';
import { InputBox } from '@/src/components/InputBox';
import { Button } from '@/src/components/buttons/Button';
import { IconButton } from '@/src/components/IconButton';
import { Plus } from '@/src/components/icons/Plus';
import { Trashcan } from '@/src/components/icons/Trashcan';
import { IToastMessage, ToastMessage } from '@/src/components/ToastMessage';
import { useSelectedCompanyStore } from '@/src/stores/selectedCompanyStore';
import { ICompany, useUserStore } from '@/src/stores/userStore';
import {
	loadCompanyDetails,
	updateCompanyKakaoPhones,
} from '@/src/utils/supabase/company';
import { useEffect, useState } from 'react';
import { HepaFilterNames, IHepaFilter, IVocFilter } from '../admin/companies/edit/[id]';
import { VocFilterLabels, defaultVocFilterType } from '@/src/constants/vocFilters';

export default function ProfilePage() {
	// 회사 기본 정보
	const [name, setName] = useState('');
	const [phone, setPhone] = useState('');
	const [email, setEmail] = useState('');
	const [address, setAddress] = useState('');
	const [floorPlanFile, setFloorPlanFile] = useState<File | null>(null);
	const [kakaoPhones, setKakaoPhones] = useState<string[]>(['']);

	// 서비스 상태 (모달로 추가/삭제)
	const [aqm, setAqm] = useState<boolean>(false);
	const [hepa, setHepa] = useState<boolean>(false);
        const [voc, setVoc] = useState<boolean>(false);
        const [vocFilters, setVocFilters] = useState<IVocFilter[]>([
                { filterType: defaultVocFilterType, quantity: 1 },
        ]);

	// HEPA 필터 목록 (기본 1개)
	const [hepaFilters, setHepaFilters] = useState<IHepaFilter[]>([
		{ filterType: 'hepa', width: 0, height: 0, depth: 0, quantity: 1 },
	]);

	const { company, setCompany } = useSelectedCompanyStore();
	const user = useUserStore((state) => state.user);
	const setUser = useUserStore((state) => state.setUser);
	const [toastMessage, setToastMessage] = useState<IToastMessage>();
        const [saving, setSaving] = useState(false);
        const [newPassword, setNewPassword] = useState('');
        const [confirmPassword, setConfirmPassword] = useState('');
        const [passwordSaving, setPasswordSaving] = useState(false);

	useEffect(() => {
		if (!company) return;

		let cancelled = false;
		getSetCompanyInfo(company, cancelled);

		return () => {
			cancelled = true;
		};
	}, [company]);

	const getSetCompanyInfo = async (company: ICompany, cancelled: boolean) => {
		setName(company.name);
		setPhone(company.phone);
		setEmail(company.email);
		setAddress(company.address);
		setKakaoPhones(company.kakaoPhones.length ? company.kakaoPhones : ['']);

		try {
			const details = await loadCompanyDetails(
				company.id,
				company.floorImagePath
			);
			if (cancelled) return;

			setFloorPlanFile(details.floorPlanFile);
			setAqm(details.aqm);
			setHepa(details.hepa);
                        setVoc(details.voc);
                        setVocFilters(
                                details.vocFilters.length
                                        ? details.vocFilters
                                        : [
                                                  {
                                                          filterType: defaultVocFilterType,
                                                          quantity: 1,
                                                  },
                                          ]
                        );
			setHepaFilters(details.hepaFilters);
		} catch (e) {
			console.error('load company details error', e);
		}
	};

	const addKakaoPhone = () => {
		setKakaoPhones((prev) => [...prev, '']);
	};

	const updateKakaoPhone = (idx: number, value: string) => {
		setKakaoPhones((prev) =>
			prev.map((phone, i) => (i === idx ? value : phone))
		);
	};

	const removeKakaoPhone = (idx: number) => {
		setKakaoPhones((prev) => {
			if (prev.length === 1) return [''];
			return prev.filter((_, i) => i !== idx);
		});
	};

        const handleSaveKakaoPhones = async () => {
                if (!company) return;

                try {
			setSaving(true);
			const sanitized = await updateCompanyKakaoPhones(
				company.id,
				kakaoPhones
			);
			const updatedCompany = {
				...company,
				kakaoPhones: sanitized,
			};
			setCompany(updatedCompany);
			if (user) {
				setUser({ ...user, company: updatedCompany });
			}
			setKakaoPhones(sanitized.length ? sanitized : ['']);
			setToastMessage({
				status: 'confirm',
				message: '카카오 알림 수신 번호가 저장되었습니다.',
			});
		} catch (e: any) {
			console.error('update kakao phones error', e);
			setToastMessage({
				status: 'error',
				message:
					e?.message ||
					'카카오 알림 수신 번호 저장 중 오류가 발생했습니다.',
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
				<p className='text-Gray-900 heading-md'>프로필</p>
			</div>

			<div className='p-6 flex flex-col gap-[20px]'>
				{/* 회사 기본정보 */}
				<Card2>
					<div className='flex flex-col gap-4'>
						<div className='flex items-center gap-4'>
							<InputBox
								label='병원명'
								inputAttr={{
									placeholder: '병원 이름 입력',
									value: name,
									disabled: true,
								}}
								isMandatory
								style={{ flex: 1 }}
							/>
							<InputBox
								label='전화번호'
								inputAttr={{
									placeholder: '02-1234-5678',
									value: phone,
									disabled: true,
								}}
								isMandatory
								style={{ flex: 1 }}
							/>
						</div>
						<div className='flex items-center gap-4'>
							<InputBox
								label='이메일'
								inputAttr={{
									placeholder: 'contact@company.com',
									value: email,
									disabled: true,
								}}
								isMandatory
								style={{ flex: 1 }}
							/>
							<InputBox
								label='주소'
								inputAttr={{
									placeholder: '전체 주소 입력',
									value: address,
									disabled: true,
								}}
								isMandatory
								style={{ flex: 1 }}
							/>
						</div>

						<div className='flex flex-col gap-2'>
							<p className='text-Gray-900 body-md-medium'>
								평면도
							</p>
							<div
								className={`relative self-stretch border-2 border-dashed border-Gray-200 rounded-[8px] transition-colors overflow-hidden bg-Gray-50`}>
								{floorPlanFile ? (
									<div className='relative'>
										<img
											src={
												floorPlanFile
													? URL.createObjectURL(
															floorPlanFile
														)
													: ''
											}
											alt={
												floorPlanFile?.name ?? 'preview'
											}
											className='w-full h-auto object-contain block'
										/>
									</div>
								) : (
									<div className='flex h-[180px] items-center justify-center'>
										<div className='flex flex-col gap-2 items-center'>
											<p className='text-Gray-500 body-md-regular'>
												파일이 없습니다.
											</p>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				</Card2>

                                <Card2>
                                        <div className='flex flex-col gap-4'>
                                                <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-3'>
                                                        <p className='text-Gray-900 body-md-medium'>
								카카오 알림 수신 번호
							</p>
							<Button
								className='w-fit'
								onClick={handleSaveKakaoPhones}
								disabled={saving}>
								{saving ? '저장 중…' : '저장하기'}
							</Button>
						</div>

						<div className='flex flex-col gap-3'>
							{kakaoPhones.map((value, idx) => (
								<div
									key={`profile-kakao-phone-${idx}`}
									className='flex items-end gap-3'>
									<InputBox
										label={`전화번호 ${idx + 1}`}
										inputAttr={{
											placeholder: '010-0000-0000',
											value,
											onChange: (e: any) =>
												updateKakaoPhone(
													idx,
													e.target.value
												),
										}}
										style={{ flex: 1 }}
									/>
									<IconButton
										icon={<Trashcan />}
										disabled={kakaoPhones.length === 1}
										onClick={() => removeKakaoPhone(idx)}
										style={{ paddingBottom: 9 }}
									/>
								</div>
							))}
							<Button
								variant='alternative'
								className='w-fit'
								onClick={addKakaoPhone}>
								<Plus /> 번호 추가
							</Button>
                                                </div>
                                        </div>
                                </Card2>

                                <Card2>
                                        <div className='flex flex-col gap-4'>
                                                <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-3'>
                                                        <p className='text-Gray-900 body-md-medium'>
                                                                비밀번호 변경
                                                        </p>
                                                        <Button
                                                                className='w-fit'
                                                                onClick={handleChangePassword}
                                                                disabled={passwordSaving}>
                                                                {passwordSaving ? '변경 중…' : '변경하기'}
                                                        </Button>
                                                </div>
                                                <div className='flex flex-col md:flex-row gap-3'>
                                                        <InputBox
                                                                label='새 비밀번호'
                                                                inputAttr={{
                                                                        type: 'password',
                                                                        placeholder: '새 비밀번호 입력',
                                                                        value: newPassword,
                                                                        onChange: (e) =>
                                                                                setNewPassword(e.target.value),
                                                                        autoComplete: 'new-password',
                                                                }}
                                                                style={{ flex: 1 }}
                                                        />
                                                        <InputBox
                                                                label='새 비밀번호 확인'
                                                                inputAttr={{
                                                                        type: 'password',
                                                                        placeholder: '새 비밀번호를 다시 입력',
                                                                        value: confirmPassword,
                                                                        onChange: (e) =>
                                                                                setConfirmPassword(e.target.value),
                                                                        autoComplete: 'new-password',
                                                                }}
                                                                style={{ flex: 1 }}
                                                        />
                                                </div>
                                                <p className='body-sm-regular text-Gray-500'>
                                                        로그인 후 즉시 비밀번호를 변경해 주시면 더 안전하게 이용할 수
                                                        있습니다.
                                                </p>
                                        </div>
                                </Card2>

				{/* 관리 서비스 */}
				<Card2>
					<div className='flex flex-col gap-4'>
						<div className='flex justify-between items-center'>
							<p className='text-Gray-900 body-md-medium'>
								관리 서비스
							</p>
						</div>

						<div className='flex flex-col gap-3'>
							{/* AQM */}
							{aqm && (
								<div className='bg-Gray-100 rounded-[8px] flex flex-col self-stretch p-4 gap-3'>
									<div className='flex items-center justify-between'>
										<p>AQM 검사 (1년)</p>
									</div>
								</div>
							)}

							{/* HEPA */}
							{hepa && (
								<div className='bg-Gray-100 rounded-[8px] flex flex-col self-stretch p-4 gap-3'>
									<div className='flex items-center justify-between'>
										<p>HEPA 필터 교체 (1년)</p>
									</div>

									{hepaFilters.map((filter, idx) => (
										<div
											key={idx}
											className='flex md:flex-row flex-col md:items-center gap-3'>
											<InputBox
												label={'필터 유형'}
												inputAttr={{
													value: HepaFilterNames[filter.filterType],
													id: `filter-type-${idx}`,
													disabled: true,
												}}
												style={{ flex: 1 }}
											/>
											<InputBox
												style={{ flex: 1 }}
												label='가로(mm)'
												inputAttr={{
													placeholder: '0',
													value: filter.width,
													disabled: true,
												}}
											/>
											<InputBox
												style={{ flex: 1 }}
												label='세로(mm)'
												inputAttr={{
													placeholder: '0',
													value: filter.height,
													disabled: true,
												}}
											/>
											<InputBox
												style={{ flex: 1 }}
												label='두께(mm)'
												inputAttr={{
													placeholder: '0',
													value: filter.depth,
													disabled: true,
												}}
											/>
											<InputBox
												style={{ flex: 1 }}
												label='개수'
												inputAttr={{
													placeholder: '0',
													value: filter.quantity,
													disabled: true,
												}}
											/>
										</div>
									))}
								</div>
							)}

							{/* VOC */}
                                                        {voc && (
                                                                <div className='bg-Gray-100 rounded-[8px] flex flex-col self-stretch p-4 gap-3'>
                                                                        <div className='flex items-center justify-between'>
                                                                                <p>VOC 필터 교체 (6개월)</p>
                                                                        </div>
                                                                        {vocFilters.map((filter, idx) => (
                                                                                <div
                                                                                        key={filter.id ?? idx}
                                                                                        className='flex md:flex-row flex-col md:items-center gap-3'>
                                                                                        <InputBox
                                                                                                style={{ minWidth: 180 }}
                                                                                                label='필터 종류'
                                                                                                inputAttr={{
                                                                                                        value:
                                                                                                                VocFilterLabels[
                                                                                                                        filter
                                                                                                                                .filterType
                                                                                                                ],
                                                                                                        readOnly: true,
                                                                                                        disabled: true,
                                                                                                }}
                                                                                        />
                                                                                        <InputBox
                                                                                                style={{ minWidth: 180 }}
                                                                                                label='개수'
                                                                                                inputAttr={{
                                                                                                        placeholder: '0',
                                                                                                        value:
                                                                                                                filter.quantity || '',
                                                                                                        disabled: true,
                                                                                                }}
                                                                                        />
                                                                                </div>
                                                                        ))}
                                                                </div>
                                                        )}
						</div>
					</div>
				</Card2>
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
