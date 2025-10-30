'use client';

import { Button } from '@/src/components/buttons/Button';
import { Card2 } from '@/src/components/Card2';
import { Dropdown } from '@/src/components/Dropdown';
import { FileUploadDrop } from '@/src/components/FileUploadDrop';
import { GNB } from '@/src/components/GNB';
import { IconButton } from '@/src/components/IconButton';
import { Close } from '@/src/components/icons/Close';
import { Plus } from '@/src/components/icons/Plus';
import { Trashcan } from '@/src/components/icons/Trashcan';
import { InputBox } from '@/src/components/InputBox';
import { ServiceAddModal } from '@/src/components/modals/ServiceAddModal';
import { SavingOverlay } from '@/src/components/SavingOverlay';
import { IToastMessage, ToastMessage } from '@/src/components/ToastMessage';
import { useScreenTypeStore } from '@/src/stores/screenTypeStore';
import { useSelectedCompanyStore } from '@/src/stores/selectedCompanyStore';
import { ICompany } from '@/src/stores/userStore';
import {
	fetchCompanyInfobyId,
	loadCompanyDetails,
	saveNewCompany,
	updateCompany,
} from '@/src/utils/supabase/company';
import { ServiceType } from '@/src/utils/supabase/companyServices';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export interface IHepaFilter {
	id?: string;
	filterType: HepaFilterType;
	width: number;
	height: number;
	depth: number;
	quantity: number;
}

export const vocFilterSpec = { width: 200, height: 100, depth: 50 };

export const HepaFilters = {
	hepa: 'hepa',
	pre: 'pre',
	preFrame: 'preFrame',
} as const;

export const HepaFilterNames = {
	hepa: 'HEPA 필터',
	pre: 'Pre 필터',
	preFrame: 'Pre 필터 (프레임)',
};

export type HepaFilterType = (typeof HepaFilters)[keyof typeof HepaFilters];

export default function AdminUsersEditPage() {
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
	const [vocQuantity, setVocQuantity] = useState<number>(0);

	// HEPA 필터 목록 (기본 1개)
	const [hepaFilters, setHepaFilters] = useState<IHepaFilter[]>([
		{ filterType: 'hepa', width: 0, height: 0, depth: 0, quantity: 1 },
	]);

	// 서비스 추가 모달 열기
	const [serviceAddModalOpen, setServiceAddModalOpen] = useState(false);

	// 저장 로딩
	const [saving, setSaving] = useState(false);

	const [toastMessage, setToastMessage] = useState<IToastMessage>();
	const [company, setCompany] = useState<ICompany>();

	// const { company, setCompany } = useSelectedCompanyStore();

	const screenType = useScreenTypeStore((state) => state.screenType);

	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		const companyId = pathname?.split('/').at(4);

		if (companyId) {
			getSetCompanyInfo(companyId);
		}
	}, [pathname]);

	const getSetCompanyInfo = async (companyId: string) => {
		try {
			const company = await fetchCompanyInfobyId(companyId);
			setCompany(company);

                        setName(company.name);
                        setPhone(company.phone);
                        setEmail(company.email);
                        setAddress(company.address);
                        setKakaoPhones(
                                company.kakaoPhones.length
                                        ? company.kakaoPhones
                                        : ['']
                        );

                        const details = await loadCompanyDetails(
                                company.id,
                                company.floorImagePath
                        );

			setFloorPlanFile(details.floorPlanFile);
			setAqm(details.aqm);
			setHepa(details.hepa);
			setVoc(details.voc);
			setVocQuantity(details.vocQuantity);
			setHepaFilters(details.hepaFilters);
		} catch (e) {
			console.error('load company details error', e);
		}
	};

	// ─────────────────────────────────────────────
	// 서비스 추가/삭제/필터 조작
	// ─────────────────────────────────────────────
	const handleAddService = (serviceType: ServiceType) => {
		if (serviceType === 'aqm') {
			setAqm(true);
		}
		if (serviceType === 'hepa') {
			setHepa(true);
		}
		if (serviceType === 'voc') {
			setVoc(true);
			if (vocQuantity === 0) setVocQuantity(1);
		}
		// 'as'는 UI 항목이 없어서 여기선 패스. 필요 시 관리 서비스 카드 추가해서 처리
	};

	const removeService = (type: ServiceType) => {
		if (type === 'aqm') setAqm(false);
		if (type === 'hepa') {
			setHepa(false);
			setHepaFilters([
				{
					filterType: 'hepa',
					width: 0,
					height: 0,
					depth: 0,
					quantity: 1,
				},
			]); // 초기화
		}
		if (type === 'voc') {
			setVoc(false);
			setVocQuantity(0);
		}
	};

	const addHepaProperty = () => {
		setHepaFilters((prev) => [
			...prev,
			{ filterType: 'hepa', width: 0, height: 0, depth: 0, quantity: 1 },
		]);
	};

	const updateHepaFilter = (idx: number, patch: Partial<IHepaFilter>) => {
		setHepaFilters((prev) =>
			prev.map((f, i) => (i === idx ? { ...f, ...patch } : f))
		);
	};

        const removeHepaFilter = (idx: number) => {
                setHepaFilters((prev) => prev.filter((_, i) => i !== idx));
        };

        const addKakaoPhone = () => {
                setKakaoPhones((prev) => [...prev, '']);
        };

        const updateKakaoPhone = (idx: number, value: string) => {
                setKakaoPhones((prev) => prev.map((phone, i) => (i === idx ? value : phone)));
        };

        const removeKakaoPhone = (idx: number) => {
                setKakaoPhones((prev) => {
                        if (prev.length === 1) return [''];
                        return prev.filter((_, i) => i !== idx);
                });
        };

	const isMandatoryInfoFilled = () => {
		if (name && phone && email && address) {
			return true;
		} else {
			alert('필수 항목들을 모두 채워주세요.');
			return false;
		}
	};

	// ─────────────────────────────────────────────
	// 저장하기: companies → company_services → hepa_filters
	// ─────────────────────────────────────────────
	const handleNewSave = async () => {
		if (isMandatoryInfoFilled()) {
			try {
				setSaving(true);
                                await saveNewCompany(
                                        floorPlanFile,
                                        name,
                                        phone,
                                        email,
                                        address,
                                        kakaoPhones,
                                        aqm,
                                        hepa,
                                        hepaFilters,
                                        voc,
                                        vocQuantity
				);

				setToastMessage({
					status: 'confirm',
					message: '저장되었습니다',
				});

				router.push('/admin/companies');
			} catch (e: any) {
				console.error(e);

				setToastMessage({
					status: 'error',
					message: '저장 중 오류가 발생했습니다',
				});
			} finally {
				setSaving(false);
			}
		}
	};

	const handleUpdate = async () => {
		if (company) {
			try {
				setSaving(true);
                                await updateCompany(
                                        company,
                                        floorPlanFile,
                                        name,
                                        phone,
                                        email,
                                        address,
                                        kakaoPhones,
                                        aqm,
                                        voc,
                                        vocQuantity,
                                        hepa,
                                        hepaFilters
				);
				setToastMessage({
					status: 'confirm',
					message: '수정되었습니다',
				});
			} catch (e: any) {
				console.error(e);
				setToastMessage({
					status: 'error',
					message: '수정 중 오류가 발생했습니다',
				});
			} finally {
				setSaving(false);
			}
		}
	};

	// 업로드 가능한 파일 타입(이미지)
	const ACCEPT_TYPES = ['.png', '.jpeg', '.jpg', '.webp', '.svg+xml'];

	return (
		<div>
			<GNB />
			<div className='flex flex-col bg-Gray-100 min-h-screen pt-[60px] md:pt-0'>
				<div className='flex justify-between items-center px-6 py-4 bg-white'>
					<p className='text-Gray-900 heading-md'>
						{company ? '고객 정보 수정' : '새 고객 추가'}
					</p>
					<Button
						onClick={company ? handleUpdate : handleNewSave}
						disabled={saving}>
						{saving ? '저장 중…' : '저장하기'}
					</Button>
				</div>

				<div className='p-6 flex flex-col gap-[20px]'>
					{/* 회사 기본정보 */}
					<Card2>
						<div className='flex flex-col gap-4'>
							<div className='flex items-center gap-4'>
								<InputBox
									label='회사명'
									inputAttr={{
										placeholder: '회사 이름 입력',
										value: name,
										onChange: (e: any) =>
											setName(e.target.value),
									}}
									isMandatory
									style={{ flex: 1 }}
								/>
								<InputBox
									label='전화번호'
									inputAttr={{
										placeholder: '02-1234-5678',
										value: phone,
										onChange: (e: any) =>
											setPhone(e.target.value),
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
										onChange: (e: any) =>
											setEmail(e.target.value),
									}}
									isMandatory
									style={{ flex: 1 }}
								/>
								<InputBox
									label='주소'
									inputAttr={{
										placeholder: '전체 주소 입력',
										value: address,
										onChange: (e: any) =>
											setAddress(e.target.value),
									}}
									isMandatory
                                                                        style={{ flex: 1 }}
                                                                />
                                                        </div>

                                                        <div className='flex flex-col gap-2'>
                                                                <p className='text-Gray-900 body-md-medium'>
                                                                        카카오 알림 수신 번호
                                                                </p>
                                                                <div className='flex flex-col gap-3'>
                                                                        {kakaoPhones.map((value, idx) => (
                                                                                <div
                                                                                        key={`kakao-phone-${idx}`}
                                                                                        className='flex items-center gap-3'>
                                                                                        <InputBox
                                                                                                label={`전화번호 ${idx + 1}`}
                                                                                                inputAttr={{
                                                                                                        placeholder:
                                                                                                                '010-0000-0000',
                                                                                                        value,
                                                                                                        onChange: (
                                                                                                                e: any
                                                                                                        ) =>
                                                                                                                updateKakaoPhone(
                                                                                                                        idx,
                                                                                                                        e.target
                                                                                                                                .value
                                                                                                                ),
                                                                                                }}
                                                                                                style={{ flex: 1 }}
                                                                                        />
                                                                                        <IconButton
                                                                                                icon={<Trashcan />}
                                                                                                disabled={
                                                                                                        kakaoPhones.length ===
                                                                                                        1
                                                                                                }
                                                                                                onClick={() =>
                                                                                                        removeKakaoPhone(
                                                                                                                idx
                                                                                                        )
                                                                                                }
                                                                                        />
                                                                                </div>
                                                                        ))}
                                                                        <Button
                                                                                variant='alternative'
                                                                                onClick={addKakaoPhone}>
                                                                                <Plus /> 번호 추가
                                                                        </Button>
                                                                </div>
                                                        </div>

                                                        <div className='flex flex-col gap-2'>
                                                                <p className='text-Gray-900 body-md-medium'>
                                                                        평면도
                                                                </p>
								<FileUploadDrop
									file={floorPlanFile}
									availableTypes={ACCEPT_TYPES}
									onFileChange={(file: File | null) =>
										setFloorPlanFile(file)
									}
								/>
							</div>
						</div>
					</Card2>

					{/* 관리 서비스 */}
					<Card2>
						<div className='flex flex-col gap-4'>
							<div className='flex justify-between items-center'>
								<p className='text-Gray-900 body-md-medium'>
									관리 서비스
								</p>
								<Button
									onClick={() =>
										setServiceAddModalOpen(true)
									}>
									서비스 추가
								</Button>
							</div>

							<div className='flex flex-col gap-3'>
								{/* AQM */}
								{aqm && (
									<div className='bg-Gray-100 rounded-[8px] flex flex-col self-stretch p-4 gap-3'>
										<div className='flex items-center justify-between'>
											<p>AQM 검사 (1년)</p>
											<IconButton
												icon={<Trashcan />}
												onClick={() =>
													removeService('aqm')
												}
											/>
										</div>
									</div>
								)}

								{/* HEPA */}
								{hepa && (
									<div className='bg-Gray-100 rounded-[8px] flex flex-col self-stretch p-4 md:gap-3 gap-6'>
										<div className='flex items-center justify-between'>
											<p>HEPA 필터 교체 (1년)</p>
											<IconButton
												icon={<Trashcan />}
												onClick={() =>
													removeService('hepa')
												}
											/>
										</div>

										{hepaFilters.map((filter, idx) => (
											<div
												key={idx}
												className='flex md:flex-row flex-col md:items-center gap-3'>
												<Dropdown
													label={'필터 유형'}
													options={[
														{
															value: HepaFilters.hepa,
															label: HepaFilterNames[
																HepaFilters.hepa
															],
														},
														{
															value: HepaFilters.pre,
															label: HepaFilterNames[
																HepaFilters.pre
															],
														},
														{
															value: HepaFilters.preFrame,
															label: HepaFilterNames[
																HepaFilters
																	.preFrame
															],
														},
													]}
													value={filter.filterType}
													id={`filter-type-${idx}`}
													onChange={(
														value: string
													) => {
														updateHepaFilter(idx, {
															filterType:
																value as HepaFilterType,
														});
													}}
													style={{ flex: 1 }}
												/>
												<InputBox
													style={{ flex: 1 }}
													label='가로(mm)'
													inputAttr={{
														placeholder: '0',
														value: filter.width,
														onChange: (e: any) =>
															updateHepaFilter(
																idx,
																{
																	width:
																		Number(
																			e
																				.target
																				.value
																		) || 0,
																}
															),
													}}
												/>
												<InputBox
													style={{ flex: 1 }}
													label='세로(mm)'
													inputAttr={{
														placeholder: '0',
														value: filter.height,
														onChange: (e: any) =>
															updateHepaFilter(
																idx,
																{
																	height:
																		Number(
																			e
																				.target
																				.value
																		) || 0,
																}
															),
													}}
												/>
												<InputBox
													style={{ flex: 1 }}
													label='두께(mm)'
													inputAttr={{
														placeholder: '0',
														value: filter.depth,
														onChange: (e: any) =>
															updateHepaFilter(
																idx,
																{
																	depth:
																		Number(
																			e
																				.target
																				.value
																		) || 0,
																}
															),
													}}
												/>
												<InputBox
													style={{ flex: 1 }}
													label='개수'
													inputAttr={{
														placeholder: '0',
														value: filter.quantity,
														onChange: (e: any) =>
															updateHepaFilter(
																idx,
																{
																	quantity:
																		Number(
																			e
																				.target
																				.value
																		) || 0,
																}
															),
													}}
												/>
												{screenType === 'pc' &&
													hepaFilters.length > 1 && (
														<IconButton
															icon={
																<Close
																	size={14}
																	fill='#6B7280'
																/>
															}
															onClick={() =>
																removeHepaFilter(
																	idx
																)
															}
															style={{
																alignSelf:
																	'end',
																paddingBottom: 10,
															}}
														/>
													)}
												{screenType === 'mobile' &&
													hepaFilters.length > 1 && (
														<Button
															variant='danger'
															onClick={() =>
																removeHepaFilter(
																	idx
																)
															}>
															삭제
														</Button>
													)}
											</div>
										))}

										<div
											className='flex items-center cursor-pointer self-end'
											onClick={addHepaProperty}>
											<Plus
												fill='#1A56DB'
												size={12}
											/>
											<p className='text-Primary-700 body-md-medium ml-1'>
												Add Property
											</p>
										</div>
									</div>
								)}

								{/* VOC */}
								{voc && (
									<div className='bg-Gray-100 rounded-[8px] flex flex-col self-stretch p-4 gap-3'>
										<div className='flex items-center justify-between'>
											<p>VOC 필터 교체 (6개월)</p>
											<IconButton
												icon={<Trashcan />}
												onClick={() =>
													removeService('voc')
												}
											/>
										</div>
										<div className='flex md:flex-row flex-col md:items-center gap-3'>
											<InputBox
												style={{ flex: 1 }}
												label='가로(mm)'
												inputAttr={{
													value: vocFilterSpec.width,
													readOnly: true,
												}}
											/>
											<InputBox
												style={{ flex: 1 }}
												label='세로(mm)'
												inputAttr={{
													value: vocFilterSpec.height,
													readOnly: true,
												}}
											/>
											<InputBox
												style={{ flex: 1 }}
												label='두께(mm)'
												inputAttr={{
													value: vocFilterSpec.depth,
													readOnly: true,
												}}
											/>
											<InputBox
												style={{ flex: 1 }}
												label='개수'
												inputAttr={{
													placeholder: '0',
													value: vocQuantity || '',
													onChange: (e: any) =>
														setVocQuantity(
															Number(
																e.target.value
															) || 0
														),
												}}
											/>
										</div>
									</div>
								)}

								{/* 처음엔 빈 박스 → 모달로 서비스 추가 */}
								{!aqm && !hepa && !voc && (
									<div className='rounded-[8px] border border-dashed border-Gray-300 p-6 h-[200px] flex justify-center items-center'>
										<p className='text-Gray-400 text-center body-md-regular'>
											관리가 필요한 서비스를 추가해
											주세요.
											<br />
											시작하려면 ‘서비스 추가’ 버튼을
											눌러주세요
										</p>
									</div>
								)}
							</div>
						</div>
					</Card2>
				</div>
				{serviceAddModalOpen && (
					<ServiceAddModal
						onConfirm={(serviceType: ServiceType) => {
							handleAddService(serviceType);
							setServiceAddModalOpen(false);
						}}
						onCancel={() => setServiceAddModalOpen(false)}
					/>
				)}
				{toastMessage && (
					<ToastMessage
						status={toastMessage.status}
						message={toastMessage.message}
						setToastMessage={setToastMessage}
					/>
				)}
				{saving && <SavingOverlay />}
			</div>
		</div>
	);
}
