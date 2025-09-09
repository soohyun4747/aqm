'use client';

import { supabaseClient } from '@/lib/supabase/client';
import { Button } from '@/src/components/buttons/Button';
import { Card2 } from '@/src/components/Card2';
import { Dropdown, Option } from '@/src/components/Dropdown';
import { FileUploadDrop } from '@/src/components/FileUploadDrop';
import { GNB } from '@/src/components/GNB';
import { IconButton } from '@/src/components/IconButton';
import { Close } from '@/src/components/icons/Close';
import { Plus } from '@/src/components/icons/Plus';
import { Trashcan } from '@/src/components/icons/Trashcan';
import { InputBox } from '@/src/components/InputBox';
import { ServiceAddModal } from '@/src/components/modals/ServiceAddModal';
import { useMemo, useState } from 'react';

interface HEPAFilter {
	filterType: HepaFilterType;
	width: number;
	height: number;
	depth: number;
	quantity: number;
}

const vocFilterSpec = { width: 200, height: 100, depth: 50 };

export const Services = {
	aqm: 'aqm',
	hepa: 'hepa',
	voc: 'voc',
	as: 'as',
} as const;

export type ServiceType = (typeof Services)[keyof typeof Services];

export const HepaFilters = {
	hepa: 'hepa',
	pre: 'pre',
	preFrame: 'preFrame',
} as const;

export type HepaFilterType = (typeof HepaFilters)[keyof typeof HepaFilters];

// function formatMonthLabel(v: string) {
// 	const [y, m] = v.split('-').map(Number);
// 	return `${y}년 ${m}월`;
// }
// function firstDayOfMonthISO(v: string) {
// 	return `${v}-01`; // YYYY-MM-01
// }
// function genNext12MonthOptions(): Option[] {
// 	const now = new Date();
// 	const arr: Option[] = [];
// 	for (let i = 0; i < 12; i++) {
// 		const d = new Date(
// 			Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + i, 1)
// 		);
// 		const y = d.getUTCFullYear();
// 		const m = String(d.getUTCMonth() + 1).padStart(2, '0');
// 		const value = `${y}-${m}`;
// 		arr.push({ value, label: formatMonthLabel(value) });
// 	}
// 	return arr;
// }

export default function AdminUsersEditPage() {
	// 회사 기본 정보
	const [name, setName] = useState('');
	const [phone, setPhone] = useState('');
	const [email, setEmail] = useState('');
	const [address, setAddress] = useState('');
	const [floorPlanFile, setFloorPlanFile] = useState<File | null>(null);

	// 서비스 상태 (모달로 추가/삭제)
	const [aqm, setAqm] = useState<boolean>(false);
	const [hepa, setHepa] = useState<boolean>(false);
	const [voc, setVoc] = useState<boolean>(false);
	const [vocQuantity, setVocQuantity] = useState<number>(0);

	// HEPA 필터 목록 (기본 1개)
	const [hepaFilters, setHepaFilters] = useState<HEPAFilter[]>([
		{ filterType: 'hepa', width: 0, height: 0, depth: 0, quantity: 1 },
	]);

	// 서비스 추가 모달 열기
	const [serviceAddModalOpen, setServiceAddModalOpen] = useState(false);

	// 드롭다운 옵션(향후 12개월)
	// const monthOptions = useMemo(() => genNext12MonthOptions(), []);

	// 저장 로딩
	const [saving, setSaving] = useState(false);

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

	const updateHepaFilter = (idx: number, patch: Partial<HEPAFilter>) => {
		setHepaFilters((prev) =>
			prev.map((f, i) => (i === idx ? { ...f, ...patch } : f))
		);
	};

	const removeHepaFilter = (idx: number) => {
		setHepaFilters((prev) => prev.filter((_, i) => i !== idx));
	};

	// ─────────────────────────────────────────────
	// 저장하기: companies → company_services → hepa_filters
	// ─────────────────────────────────────────────
	const handleSave = async () => {
		try {
			setSaving(true);
			const supabase = supabaseClient();

			// (1) 평면도 Storage 업로드 (선택)
			let floorImagePath: string | null = null;
			if (floorPlanFile) {
				const fileName = `${Date.now()}_${floorPlanFile.name}`;
				const { data: up, error: upErr } = await supabase.storage
					.from('floor-plans') // ← 버킷 이름(미리 만들기)
					.upload(fileName, floorPlanFile, { upsert: false });
				if (upErr) throw upErr;
				floorImagePath = up?.path ?? null;
			}

			// (2) 회사 생성
			const { data: companyRow, error: cErr } = await supabase
				.from('companies')
				.insert({
					name,
					phone: phone || null,
					email: email || null,
					address: address || null,
					floor_image_path: floorImagePath,
				})
				.select('id')
				.single();
			if (cErr) throw cErr;

			const companyId = companyRow.id as string;

			// (3) 서비스 생성 (존재하는 것만)
			// AQM
			if (aqm) {
				const { data, error } = await supabase
					.from('company_services')
					.insert({
						company_id: companyId,
						service_type: 'aqm',
						// starting_date: firstDayOfMonthISO(aqmStart),
					})
					.select('id')
					.single();
				if (error) throw error;
			}

			// HEPA
			let hepaServiceId: string | null = null;
			if (hepa) {
				const { data, error } = await supabase
					.from('company_services')
					.insert({
						company_id: companyId,
						service_type: 'hepa',
						// starting_date: firstDayOfMonthISO(hepaStart),
					})
					.select('id')
					.single();
				if (error) throw error;
				hepaServiceId = data!.id;

				// hepa_filters 다건 입력
				if (hepaFilters.length) {
					const payload = hepaFilters.map((f) => ({
						company_id: companyId,
						company_service_id: hepaServiceId!,
						filter_type:
							f.filterType === 'preFrame' ? 'pre' : f.filterType, // DB는 'hepa'|'pre'
						width: Number(f.width) || 0,
						height: Number(f.height) || 0,
						depth: Number(f.depth) || 0,
						quantity: Number(f.quantity) || 0,
						// installed_at: firstDayOfMonthISO(hepaStart), // 최초 설치일 = 시작월 1일(편의)
					}));
					const { error: hErr } = await supabase
						.from('hepa_filters')
						.insert(payload);
					if (hErr) throw hErr;
				}
			}

			// VOC
			if (voc) {
				const { error } = await supabase
					.from('company_services')
					.insert({
						company_id: companyId,
						service_type: 'voc',
						// starting_date: firstDayOfMonthISO(vocStart),
						quantity: vocQuantity || null,
					});
				if (error) throw error;
			}

			// TODO: 'as' 서비스도 UI에 보이면 동일 패턴으로 추가

			alert('저장되었습니다.');
			// 필요 시 라우팅 이동
			// router.push('/admin/users');
		} catch (e: any) {
			console.error(e);
			alert(e?.message ?? '저장 중 오류가 발생했습니다.');
		} finally {
			setSaving(false);
		}
	};

	// 업로드 가능한 파일 타입(이미지)
	const ACCEPT_TYPES = [
		'.png',
		'.jpeg',
		'.webp',
		'.svg+xml',
	];

	return (
		<div className='flex flex-col bg-Gray-100 min-h-screen'>
			<GNB />

			<div className='flex justify-between items-center px-6 py-4 bg-white'>
				<p className='text-Gray-900 heading-md'>새 고객 추가</p>
				<Button
					onClick={handleSave}
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
								style={{ flex: 1 }}
							/>
						</div>

						<div className='flex flex-col'>
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
								onClick={() => setServiceAddModalOpen(true)}>
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
											onClick={() => removeService('aqm')}
										/>
									</div>
									{/* <Dropdown
										label={'시작 월'}
										options={monthOptions}
										// 보여주는 라벨은 한글, 내부값은 m(YYYY-MM)
										value={aqmStart}
										id={'aqm-start-dropdown'}
										onChange={(value: string) =>
											setAqmStart(value)
										}
										className={'md:max-w-[360px]'}
									/> */}
								</div>
							)}

							{/* HEPA */}
							{hepa && (
								<div className='bg-Gray-100 rounded-[8px] flex flex-col self-stretch p-4 gap-3'>
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
											className='flex items-center gap-3'>
											<Dropdown
												label={'필터 유형'}
												options={[
													{
														value: HepaFilters.hepa,
														label: 'HEPA 필터',
													},
													{
														value: HepaFilters.pre,
														label: 'PRE 필터',
													},
													{
														value: HepaFilters.preFrame,
														label: 'PRE 필터 (프레임)',
													},
												]}
												value={filter.filterType}
												id={`filter-type-${idx}`}
												onChange={(value: string) => {
													updateHepaFilter(idx, {
														filterType:
															value as HepaFilterType,
													});
												}}
												style={{ flex: 1 }}
											/>

											{/* <Dropdown
												label={'시작 월'}
												options={monthOptions}
												value={hepaStart}
												id={`hepa-start-dropdown-${idx}`}
												onChange={(value: string) =>
													setHepaStart(value)
												}
												style={{ flex: 1 }}
											/> */}

											<InputBox
												style={{ flex: 1 }}
												label='가로(mm)'
												inputAttr={{
													placeholder: '0',
													value: filter.width,
													onChange: (e: any) =>
														updateHepaFilter(idx, {
															width:
																Number(
																	e.target
																		.value
																) || 0,
														}),
												}}
											/>
											<InputBox
												style={{ flex: 1 }}
												label='세로(mm)'
												inputAttr={{
													placeholder: '0',
													value: filter.height,
													onChange: (e: any) =>
														updateHepaFilter(idx, {
															height:
																Number(
																	e.target
																		.value
																) || 0,
														}),
												}}
											/>
											<InputBox
												style={{ flex: 1 }}
												label='두께(mm)'
												inputAttr={{
													placeholder: '0',
													value: filter.depth,
													onChange: (e: any) =>
														updateHepaFilter(idx, {
															depth:
																Number(
																	e.target
																		.value
																) || 0,
														}),
												}}
											/>
											<InputBox
												style={{ flex: 1 }}
												label='개수'
												inputAttr={{
													placeholder: '0',
													value: filter.quantity,
													onChange: (e: any) =>
														updateHepaFilter(idx, {
															quantity:
																Number(
																	e.target
																		.value
																) || 0,
														}),
												}}
											/>

											{hepaFilters.length > 1 && (
												<IconButton
													icon={
														<Close
															size={14}
															fill='#6B7280'
														/>
													}
													onClick={() =>
														removeHepaFilter(idx)
													}
													style={{
														alignSelf: 'end',
														paddingBottom: 10,
													}}
												/>
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
											onClick={() => removeService('voc')}
										/>
									</div>
									<div className='flex items-center gap-3'>
										{/* <Dropdown
											label={'시작 월'}
											options={monthOptions}
											value={vocStart}
											id={'voc-start-dropdown'}
											onChange={(value: string) =>
												setVocStart(value)
											}
											style={{ flex: 1 }}
										/> */}

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
										관리가 필요한 서비스를 추가해 주세요.
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
		</div>
	);
}
