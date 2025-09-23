import { Button } from '@/src/components/buttons/Button';
import { Card } from '@/src/components/Card';
import { DatePicker } from '@/src/components/DatePicker';
import { Dropdown, Option } from '@/src/components/Dropdown';
import { FileUploadDrop } from '@/src/components/FileUploadDrop';
import { GNB } from '@/src/components/GNB';
import { InputBox } from '@/src/components/InputBox';
import { Radio } from '@/src/components/Radio';
import { SavingOverlay } from '@/src/components/SavingOverlay';
import { TextAreaBox } from '@/src/components/TextAreaBox';
import { IToastMessage, ToastMessage } from '@/src/components/ToastMessage';
import { useManagementRecordStore } from '@/src/stores/managementRecordStore';
import { today } from '@/src/utils/date';
import { fetchCompanyOptions } from '@/src/utils/supabase/company';
import { useEffect, useState } from 'react';
import { IManagementRecord } from '../..';
import {
	loadAqmBundleAsFiles,
	upsertAqmResult,
} from '@/src/utils/supabase/aqmResults';
import { createManagementRecord } from '@/src/utils/supabase/managementRecord';
import { useRouter } from 'next/router';
import { Services } from '../../../companies/edit';

export type MicrobioAnalysisType = 'pass' | 'fail';

export interface IAQMResult {
	id: string;
	managementRecordId: string;
	pmFilePath: string;
	vocFilePath: string;
	aqmFilePath: string;
	microbioFilePath: string;
	microbioAnalysis: MicrobioAnalysisType;
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

	const [companyOptions, setCompanyOptions] = useState<Option[]>([]);

	// 저장 로딩
	const [saving, setSaving] = useState(false);
	const [toastMessage, setToastMessage] = useState<IToastMessage>();

	const { managementRecord, setManagementRecord } =
		useManagementRecordStore();

	const router = useRouter();

	useEffect(() => {
		return () => {
			setManagementRecord(undefined);
		};
	}, []);

	useEffect(() => {
		if (managementRecord) {
			loadAqmResult(managementRecord);
		}
	}, [managementRecord]);

	useEffect(() => {
		getSetCompanyOptions();
	}, []);

	const loadAqmResult = async (managementRecord: IManagementRecord) => {
		try {
			const { record, result, files } = await loadAqmBundleAsFiles(
				managementRecord.id
			);
			setDate(new Date(record.date));
			setCompanyId(record.company_id);
			setManager(record.manager_name ?? '');
			setMicrobioAnal(result?.microbio_analysis ?? undefined);
            setComment(record.comment)

            console.log({files, result});
            

			// 파일 필드
			setMicrobioFile(files.microbioFile);
			setPmFile(files.pmFile);
			setVocFile(files.vocFile);
			setAqmFile(files.aqmFile);
		} catch (e) {
			console.error(e);
			setToastMessage({ status: 'error', message: '데이터 로드 실패' });
		}
	};

	const getSetCompanyOptions = async () => {
		const options = await fetchCompanyOptions();
		setCompanyOptions(options);
	};

	const handleNewSave = async () => {
		if (!companyId || !manager) {
			setToastMessage({
				status: 'warning',
				message: '필수 값들을 입력해주세요',
			});
			return;
		}
		setSaving(true);
		try {
			const rec = await createManagementRecord({
				companyId,
				date,
				managerName: manager,
				serviceType: Services.aqm,
				comment: comment,
			});

			await upsertAqmResult({
				companyId,
				recordId: rec.id,
				microbioFile,
				pmFile,
				vocFile,
				aqmFile,
				microbioAnal: microbioAnal,
			});

			setToastMessage({ status: 'confirm', message: '저장되었습니다.' });
			router.push('/admin/managementRecords');
		} catch (e: any) {
			console.error(e);
			setToastMessage({
				status: 'error',
				message: e?.message ?? '저장 중 오류',
			});
		} finally {
			setSaving(false);
		}
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
		<div className='flex flex-col bg-Gray-100 min-h-screen'>
			<GNB />
			<div className='flex justify-between items-center px-6 py-4 bg-white'>
				<p className='text-Gray-900 heading-md'>AQM 검사 기록</p>
				<Button
					onClick={managementRecord ? handleUpdate : handleNewSave}
					disabled={saving}>
					{saving ? '저장 중…' : '저장하기'}
				</Button>
			</div>

			<div className='p-6 flex gap-4'>
				<div className='flex flex-col gap-4 w-[330px]'>
					<Card>
						<div className='flex flex-col gap-[12px]'>
							<DatePicker
								date={date}
								onChange={(date) => setDate(date)}
							/>
							<Dropdown
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
									onChange: (e) => setManager(e.target.value),
								}}
							/>
						</div>
					</Card>
					<Card className='flex-1'>
						<div className='flex flex-col gap-[6px]'>
							<p className='heading-md text-Gray-900'>코멘트</p>
							<TextAreaBox
								textareaAttr={{
									rows: 15,
									value: comment,
									onChange: (e) => setComment(e.target.value),
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
								onFileChange={(file) => setMicrobioFile(file)}
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
	);
}

export default AdminManagementRecordsEditAQMPage;
