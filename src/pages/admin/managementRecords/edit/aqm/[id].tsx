import { Button } from '@/src/components/buttons/Button';
import { Card } from '@/src/components/Card';
import { DatePicker } from '@/src/components/DatePicker';
import { Option } from '@/src/components/Dropdown';
import { FileUploadDrop } from '@/src/components/FileUploadDrop';
import { GNB } from '@/src/components/GNB';
import { InputBox } from '@/src/components/InputBox';
import { Radio } from '@/src/components/Radio';
import { SavingOverlay } from '@/src/components/SavingOverlay';
import { TextAreaBox } from '@/src/components/TextAreaBox';
import { IToastMessage, ToastMessage } from '@/src/components/ToastMessage';
import { today } from '@/src/utils/date';
import { fetchCompanyOptions } from '@/src/utils/supabase/company';
import { useEffect, useState } from 'react';
import {
	loadAqmBundleAsFiles,
	upsertAqmResult,
} from '@/src/utils/supabase/aqmResults';
import {
	fetchManagementRecordById,
	IManagementRecordRow,
} from '@/src/utils/supabase/managementRecord';
import { useRouter } from 'next/router';
import { DropdownSearchable } from '@/src/components/DropdownSearchable';
import { usePathname } from 'next/navigation';
import { aqmDangerStandards, Series } from '@/src/pages/managementRecords/detail/aqm/[id]';
import {
	buildAqmData,
	buildPmDataByPosition,
	buildVocData,
	detectUnit,
} from '@/src/utils/file';
import { BarChart } from '@/src/components/BarChart';

export type MicrobioAnalysisType = 'pass' | 'fail';

export interface IAQMResult {
	id: string;
	managementRecordId: string;
	pmFilePath?: string | null;
	vocFilePath?: string | null;
	aqmFilePath?: string | null;
	microbioFilePath?: string | null;
	microbioAnalysis?: MicrobioAnalysisType | null;
}

function AdminManagementRecordsEditAQMPage() {
	const [aqmResult, setAqmResult] = useState<IAQMResult>();

	const [date, setDate] = useState<Date>(today);
	const [companyId, setCompanyId] = useState('');
	const [manager, setManager] = useState('');
	const [comment, setComment] = useState('');
	const [microbioFile, setMicrobioFile] = useState<File | null>(null);
	const [microbioAnal, setMicrobioAnal] = useState<MicrobioAnalysisType>();

	const [pmFile, setPmFile] = useState<File | null>(null);
	const [vocFile, setVocFile] = useState<File | null>(null);
	const [aqmFile, setAqmFile] = useState<File | null>(null);

	const [pmDataByPosition, setPmDataByPosition] = useState<
		Record<string, Series[]>
	>({});
	const [vocData, setVocData] = useState<Series[]>([]);
	const [aqmData, setAqmData] = useState<Series[]>([]);

	const [companyOptions, setCompanyOptions] = useState<Option[]>([]);

	// 저장 로딩
	const [saving, setSaving] = useState(false);
	const [toastMessage, setToastMessage] = useState<IToastMessage>();

	const pathname = usePathname();
	const recordId = pathname?.split('/').at(5);

	useEffect(() => {
		if (recordId) {
			getSetManagementRecordAndResult(recordId);
		}
	}, [recordId]);

	useEffect(() => {
		getSetCompanyOptions();
	}, []);

	useEffect(() => {
		if (pmFile) {
			getSetPmDataByPosition(pmFile);
		} else {
			setPmDataByPosition({});
		}
	}, [pmFile]);

	useEffect(() => {
		if (vocFile) {
			getSetVocData(vocFile);
		} else {
			setVocData([]);
		}
	}, [vocFile]);

	useEffect(() => {
		if (aqmFile) {
			getSetAqmData(aqmFile);
		} else {
			setAqmData([]);
		}
	}, [aqmFile]);

	const getSetPmDataByPosition = async (pmFile: File) => {
		const charts = await buildPmDataByPosition(pmFile);
		setPmDataByPosition(charts); // 채널별 {data(3개), max, unit}
	};

	const getSetVocData = async (vocFile: File) => {
		const data = await buildVocData(vocFile);
		setVocData(data);
	};

	const getSetAqmData = async (aqmFile: File) => {
		const data = await buildAqmData(aqmFile);
		setAqmData(data);
	};

	const getSetManagementRecordAndResult = async (recordId: string) => {
		try {
			const recordInfo = await fetchManagementRecordById(recordId);
			if (recordInfo) {
				loadAqmResult(recordInfo);
			}
		} catch (error) {
			console.error(error);
			setToastMessage({ status: 'error', message: '데이터 로드 실패' });
		}
	};

	const loadAqmResult = async (managementRecord: IManagementRecordRow) => {
		try {
			const { record, result, files } = await loadAqmBundleAsFiles(
				managementRecord.id
			);
			setDate(new Date(record.date));
			setCompanyId(record.company_id);
			setManager(record.manager_name ?? '');
			setMicrobioAnal(result?.microbio_analysis ?? undefined);
			setComment(record.comment);

			// 파일 필드
			setMicrobioFile(files.microbioFile);
			setPmFile(files.pmFile);
			setVocFile(files.vocFile);
			setAqmFile(files.aqmFile);

			if (result) {
				setAqmResult({
					id: result.id,
					managementRecordId: result.management_record_id,
					pmFilePath: result.pm_file_path,
					vocFilePath: result.voc_file_path,
					aqmFilePath: result.aqm_file_path,
					microbioFilePath: result.microbio_file_path,
					microbioAnalysis: result.microbio_analysis,
				});
			}
		} catch (e) {
			console.error(e);
			setToastMessage({ status: 'error', message: '데이터 로드 실패' });
		}
	};

	const getSetCompanyOptions = async () => {
		const options = await fetchCompanyOptions();
		setCompanyOptions(options);
	};

	const handleUpdate = async () => {
		if (!aqmResult) {
			setToastMessage({
				status: 'warning',
				message: '기존 정보가 존재하지 않습니다.',
			});
			return;
		}
		if (!companyId || !manager) {
			setToastMessage({
				status: 'warning',
				message: '필수 값들을 입력해 주세요',
			});
			return;
		}
		setSaving(true);
		try {
			// management_records 메타 업데이트가 필요하면 별도 update 함수 작성
			await upsertAqmResult({
				companyId,
				recordId: aqmResult.managementRecordId,
				microbioFile,
				pmFile,
				vocFile,
				aqmFile,
				microbioAnal: microbioAnal,
			});

			setToastMessage({ status: 'confirm', message: '수정되었습니다.' });
		} catch (e: any) {
			console.error(e);
			setToastMessage({
				status: 'error',
				message: e?.message ?? '수정 중 오류',
			});
		} finally {
			setSaving(false);
		}
	};

	return (
		<div>
			<GNB />
			<div className='flex flex-col bg-Gray-100 min-h-screen pt-[60px] md:pt-0'>
				<div className='flex justify-between items-center px-6 py-4 bg-white'>
					<p className='text-Gray-900 heading-md'>AQM 검사 기록</p>
					<Button
						onClick={handleUpdate}
						disabled={saving}>
						{saving ? '저장 중…' : '저장하기'}
					</Button>
				</div>
				<div className='p-6 flex md:flex-row flex-col gap-4'>
					<div className='flex flex-col gap-4 w-[330px]'>
						<Card>
							<div className='flex flex-col gap-[12px]'>
								<DatePicker
									date={date}
									onChange={(date) => setDate(date)}
								/>
								<DropdownSearchable
									isMandatory
									label={'고객'}
									options={companyOptions}
									value={companyId}
									id={'aqm_company_dropdown'}
									onChange={(value) => setCompanyId(value)}
								/>
								<InputBox
									isMandatory
									label='관리자'
									inputAttr={{
										value: manager,
										onChange: (e) =>
											setManager(e.target.value),
									}}
								/>
							</div>
						</Card>
						<Card>
							<div className='flex flex-col gap-[6px]'>
								<p className='heading-md text-Gray-900'>
									코멘트
								</p>
								<TextAreaBox
									textareaAttr={{
										rows: 15,
										value: comment,
										onChange: (e) =>
											setComment(e.target.value),
									}}
								/>
							</div>
						</Card>
						<Card>
							<div className='flex flex-col gap-4'>
								<p className='heading-md text-Gray-900'>
									미생물 분석
								</p>
								<FileUploadDrop
									file={microbioFile}
									availableTypes={['.png', '.jpg', '.jpeg']}
									onFileChange={(file) =>
										setMicrobioFile(file)
									}
								/>
								<Radio
									label={'합격'}
									onClick={() => setMicrobioAnal('pass')}
									selected={microbioAnal === 'pass'}
								/>
								<Radio
									label={'불합격'}
									onClick={() => setMicrobioAnal('fail')}
									selected={microbioAnal === 'fail'}
								/>
							</div>
						</Card>
					</div>
					<div className='flex flex-col gap-4 flex-1'>
						<Card>
							<div className='flex flex-col gap-6'>
								<div className='flex flex-col gap-2 border-b border-Gray-200 pb-4'>
									<p className='heading-md text-Gray-900'>
										PM Measurements
									</p>
									<p className='body-lg-regular text-Gray-500'>
										PM 검사 파일을 넣어주세요
									</p>
								</div>
								<FileUploadDrop
									file={pmFile}
									onFileChange={(file) => setPmFile(file)}
									availableTypes={['.csv', '.xlsx', '.xls']}
								/>
								<div className='flex flex-col gap-12'>
									{Object.keys(pmDataByPosition).map(
										(pos) => (
											<div
												key={pos}
												className='flex flex-col gap-1'>
												<p className='text-Primary-700 body-lg-medium'>
													{pos}
												</p>
												<BarChart
													safeStandard={''}
													warningStandard={''}
													dangerStandard={''}
													maxValue={200}
													unit={'CNT'}
													data={
														pmDataByPosition[pos] ??
														[]
													} // ← 여기 길이가 3 (position1~3)
												/>
											</div>
										)
									)}
								</div>
							</div>
						</Card>
						<Card>
							<div className='flex flex-col gap-6'>
								<div className='flex flex-col gap-2 border-b border-Gray-200 pb-4'>
									<p className='heading-md text-Gray-900'>
										VOC Measurements
									</p>
									<p className='body-lg-regular text-Gray-500'>
										VOC 검사 파일을 넣어주세요.
									</p>
								</div>
								<FileUploadDrop
									file={vocFile}
									onFileChange={(file) => setVocFile(file)}
									availableTypes={['.csv', '.xlsx', '.xls']}
								/>
								<div className='flex flex-col gap-1'>
									<p className='text-Primary-700 body-lg-medium'>
										VOCs{' '}
										<span className='text-Gray-400 body-lg-regular'>
											(Volatile Organic Compounds)
										</span>
									</p>
									<BarChart
										safeStandard={'0-400'}
										warningStandard={'401-500'}
										dangerStandard={'>501'}
										maxValue={600}
										unit={'µg/m3'}
										data={vocData}
									/>
								</div>
							</div>
						</Card>
						<Card>
							<div className='flex flex-col gap-6'>
								<div className='flex flex-col gap-2 border-b border-Gray-200 pb-4'>
									<p className='heading-md text-Gray-900'>
										Air Quality Measurements
									</p>
									<p className='body-lg-regular text-Gray-500'>
										AQM 검사 파일을 넣어주세요.
									</p>
								</div>
								<FileUploadDrop
									file={aqmFile}
									onFileChange={(file) => setAqmFile(file)}
									availableTypes={['.txt', '.Txt']}
								/>
								{aqmData.map((d) => (
									<div
										key={d.label}
										className='flex flex-col gap-1'>
										<p className='text-Primary-700 body-lg-medium'>
											{d.label}
										</p>
										<BarChart
											safeStandard={''} // 항목별 기준 다르면 여기서 분기 처리
											warningStandard={''}
											dangerStandard={
												aqmDangerStandards[d.label] ??
												''
											}
											maxValue={Math.ceil(d.value * 1.2)} // 평균값 기반으로 여유 잡기
											unit={detectUnit(d.label)} // 단위 표시
											data={[
												{
													label: d.label.split(
														'('
													)[0],
													value: d.value,
												},
											]} // 🔑 한 항목 = 막대 1개
										/>
									</div>
								))}
							</div>
						</Card>
					</div>
				</div>
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

export default AdminManagementRecordsEditAQMPage;
