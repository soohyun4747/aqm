import { Button } from '@/src/components/buttons/Button';
import { Card } from '@/src/components/Card';
import { Table, TableHeader } from '@/src/components/datagrid/Table';
import { DatePicker } from '@/src/components/DatePicker';
import { Dropdown, Option } from '@/src/components/Dropdown';
import { GNB } from '@/src/components/GNB';
import { InputBox } from '@/src/components/InputBox';
import { SavingOverlay } from '@/src/components/SavingOverlay';
import { TextAreaBox } from '@/src/components/TextAreaBox';
import { IToastMessage, ToastMessage } from '@/src/components/ToastMessage';
import { useManagementRecordStore } from '@/src/stores/managementRecordStore';
import { today } from '@/src/utils/date';
import { useEffect, useState } from 'react';
import {
	HepaFilterNames,
	HepaFilterType,
	IHepaFilter,
} from '../../../companies/edit';
import { Checkbox } from '@/src/components/Checkbox';
import { fetchHepaFiltersWithCompanyId } from '@/src/utils/supabase/hepaFilters';
import {
	createManagementRecord,
	updateManagementRecord,
} from '@/src/utils/supabase/managementRecord';
import {
	createHepaResults,
	fetchHepaResultsByRecordId,
	updateHepaResultsViaRpc,
} from '@/src/utils/supabase/hepaResults';
import { fetchCompanyOptions } from '@/src/utils/supabase/company';
import { useRouter } from 'next/router';

export interface IHEPAResult {
	id?: string;
	companyId: string;
	managementRecordId?: string;
	filterId: string;
	confirm: boolean;
}

function AdminManagementRecordsEditHepaPage() {
	const [hepaResults, setHepaResults] = useState<IHEPAResult[]>([]);
	const [hepaFilters, setHepaFilters] = useState<IHepaFilter[]>([]);

	const [date, setDate] = useState<Date>(today);
	const [companyId, setCompanyId] = useState('');
	const [manager, setManager] = useState('');
	const [comment, setComment] = useState('');

	const [companyOptions, setCompanyOptions] = useState<Option[]>([]);
	const [saving, setSaving] = useState(false);
	const [toastMessage, setToastMessage] = useState<IToastMessage>();
	const { managementRecord, setManagementRecord } =
		useManagementRecordStore();

	const router = useRouter();

	useEffect(() => {
		getSetCompanyOptions();

        return () => {
            setManagementRecord(undefined)
        }
	}, []);

	useEffect(() => {
		if (!managementRecord) return;
		// store에 있다고 가정한 필드명에 맞게 세팅
		setDate(new Date(managementRecord.date));
		setCompanyId(managementRecord.companyId);
		setManager(managementRecord.managerName ?? '');

		setComment(managementRecord.comment ?? '');

		getSetHepaResults(managementRecord.id);
		getSetHepaFilters(managementRecord.companyId);
	}, [managementRecord]);

	const onSelectCompany = (companyId: string) => {
		setCompanyId(companyId);
		if (companyId) {
			getSetHepaFiltersandInitResults(companyId);
		} else {
			setHepaFilters([]);
			setHepaResults([]);
		}
	};

	const getSetHepaResults = async (recordId: string) => {
		try {
			const data = await fetchHepaResultsByRecordId(recordId);

			const mapped: IHEPAResult[] =
				(data ?? []).map((row) => ({
					id: row.id,
					companyId: row.company_id,
					managementRecordId: row.management_record_id,
					filterId: row.filter_id,
					confirm: row.confirm,
				})) ?? [];
			setHepaResults(mapped);
		} catch (error) {
			console.error(error);
			setToastMessage({
				status: 'error',
				message: '데이터를 불러오는데 실패하였습니다',
			});
		}
	};

	const getSetCompanyOptions = async () => {
		const options = await fetchCompanyOptions();
		setCompanyOptions(options);
	};

	const getSetHepaFilters = async (companyId: string) => {
		try {
			const data = await fetchHepaFiltersWithCompanyId(companyId);
			setHepaFilters((data as unknown as IHepaFilter[]) ?? []);
		} catch (error) {
			setToastMessage({
				status: 'error',
				message: '데이터를 불러오는데 실패하였습니다',
			});
		}
	};

	const getSetHepaFiltersandInitResults = async (companyId: string) => {
		try {
			const data = await fetchHepaFiltersWithCompanyId(companyId);
			setHepaFilters((data as unknown as IHepaFilter[]) ?? []);
			setHepaResults(
				data.map((filter) => ({
					companyId: companyId,
					filterId: filter.id!,
					confirm: false,
				}))
			);
		} catch (error) {
			setToastMessage({
				status: 'error',
				message: '데이터를 불러오는데 실패하였습니다',
			});
		}
	};


        console.log(hepaResults);

	const onClickFilterConfirm = (row: IHepaFilter) => {
        console.log(row);
        console.log(hepaResults);
        
        
		setHepaResults((prev) => {
			if (prev) {
				const result = prev.find((res) => res.filterId === row.id);
				if (result) {
					result.confirm = !result.confirm;
					return JSON.parse(JSON.stringify(prev));
				}
			}
		});
	};

	const onClickAllCheck = () => {
		setHepaResults((prev) => {
			if (prev.length > 0) {
				const allChecked = prev.map((res) => {
					res.confirm = true;
					return { ...res };
				});
				return allChecked;
			} else {
				return prev;
			}
		});
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
			const newManagementRecord = await createManagementRecord({
				companyId: companyId,
				date: date,
				managerName: manager,
				comment: comment,
				serviceType: 'hepa',
			});

			const managementRecordId = newManagementRecord.id;

			// 2) hepa_results 일괄 insert (현재 상태 전체 저장)
			const hepaResultsWithIds = hepaResults.map((r) => ({
				company_id: companyId,
				management_record_id: managementRecordId,
				filter_id: r.filterId,
				confirm: r.confirm,
			}));

			if (hepaResultsWithIds.length > 0) {
				await createHepaResults(hepaResultsWithIds);
			}

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

	const handleUpdate = async () => {
		if (!companyId || !manager) {
			setToastMessage({
				status: 'warning',
				message: '필수 값들을 입력해주세요',
			});
			return;
		}
		if (!managementRecord) {
			setToastMessage({
				status: 'error',
				message: '기존 데이터가 없습니다',
			});
			return;
		}
		setSaving(true);
		try {
            
			// 1) management_records 업데이트
			await updateManagementRecord(
				managementRecord.id,
				companyId,
				date,
				manager,
				comment,
				'hepa'
			);

			// 2) hepa_results update
			const hepaResultsWithIds = hepaResults.map((r) => ({
				company_id: companyId,
				management_record_id: managementRecord.id,
				filter_id: r.filterId,
				confirm: r.confirm,
			}));
			if (hepaResultsWithIds.length > 0) {
				await updateHepaResultsViaRpc(hepaResultsWithIds);
			}

			setToastMessage({ status: 'confirm', message: '수정되었습니다' });
		} catch (err) {
			console.error('handleUpdate error:', err);
			setToastMessage({
				status: 'error',
				message: '수정을 실패하였습니다',
			});
		} finally {
			setSaving(false);
		}
	};

	const columns: TableHeader[] = [
		{
			field: 'filter_type',
			headerName: '필터 종류',
			render: (value: HepaFilterType) => HepaFilterNames[value],
		},
		{
			field: 'width',
			headerName: '가로',
		},
		{
			field: 'height',
			headerName: '세로',
		},
		{
			field: 'depth',
			headerName: '두께',
		},
		{
			field: 'quantity',
			headerName: '개수',
		},
		{
			field: '',
			headerName: '확인',
			render: (value, row) => {
				return (
					<Checkbox
						label={''}
						onClick={() => onClickFilterConfirm(row)}
						checked={
							hepaResults?.find((res) => res.filterId === row.id)
								?.confirm
						}
					/>
				);
			},
		},
	];

	return (
		<div className='flex flex-col bg-Gray-100 min-h-screen'>
			<GNB />
			<div className='flex justify-between items-center px-6 py-4 bg-white'>
				<p className='text-Gray-900 heading-md'>HEPA 필터 교체 기록</p>
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
								onChange={onSelectCompany}
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
				</div>
				<div className='flex flex-col gap-4 flex-1'>
					<Card>
						<div className='flex flex-col'>
							<div className='flex items-center justify-between pb-4'>
								<p className='text-Gray-900 heading-sm'>
									교체 내용
								</p>
								<Button
									variant='alternative'
									onClick={onClickAllCheck}>
									전체 확인
								</Button>
							</div>
							<Table
								columns={columns}
								rows={hepaFilters}
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

export default AdminManagementRecordsEditHepaPage;
