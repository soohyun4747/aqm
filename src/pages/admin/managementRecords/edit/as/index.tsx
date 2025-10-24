import { Button } from '@/src/components/buttons/Button';
import { Card } from '@/src/components/Card';
import { DatePicker } from '@/src/components/DatePicker';
import { Option } from '@/src/components/Dropdown';
import { GNB } from '@/src/components/GNB';
import { InputBox } from '@/src/components/InputBox';
import { SavingOverlay } from '@/src/components/SavingOverlay';
import { TextAreaBox } from '@/src/components/TextAreaBox';
import { IToastMessage, ToastMessage } from '@/src/components/ToastMessage';
import { today } from '@/src/utils/date';
import { useEffect, useState } from 'react';
import {
	createManagementRecord,
} from '@/src/utils/supabase/managementRecord';
import { fetchCompanyOptions } from '@/src/utils/supabase/company';
import { useRouter } from 'next/router';
import { DropdownSearchable } from '@/src/components/DropdownSearchable';

function AdminManagementRecordsEditASPage() {
	const [date, setDate] = useState<Date>(today);
	const [companyId, setCompanyId] = useState('');
	const [manager, setManager] = useState('');
	const [comment, setComment] = useState('');

	const [companyOptions, setCompanyOptions] = useState<Option[]>([]);
	const [saving, setSaving] = useState(false);
	const [toastMessage, setToastMessage] = useState<IToastMessage>();

	const router = useRouter();

	useEffect(() => {
		getSetCompanyOptions();
	}, []);

	const onSelectCompany = (companyId: string) => {
		setCompanyId(companyId);
	};

	const getSetCompanyOptions = async () => {
		const options = await fetchCompanyOptions();
		setCompanyOptions(options);
	};
	// ---------- save/update ----------
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
			// 1) management_records 생성
			await createManagementRecord({
				companyId: companyId,
				date: date,
				managerName: manager,
				comment: comment,
				serviceType: 'as',
			});

			setToastMessage({ status: 'confirm', message: '저장되었습니다.' });
			router.push('/admin/managementRecords');
		} catch (err) {
			console.error('handleNewSave error:', err);
			setToastMessage({
				status: 'error',
				message: '저장에 실패했습니다.',
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
					<p className='text-Gray-900 heading-md'>
						장비 설치 및 AS 기록
					</p>
					<Button
						onClick={handleNewSave}
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
									onChange={onSelectCompany}
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
					</div>
					<div className='flex flex-col gap-4 flex-1'>
						<Card className='flex-1'>
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

export default AdminManagementRecordsEditASPage;
