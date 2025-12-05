import { Button } from '@/src/components/buttons/Button';
import { Card } from '@/src/components/Card';
import { Table, TableHeader } from '@/src/components/datagrid/Table';
import { DatePicker } from '@/src/components/DatePicker';
import { Option } from '@/src/components/Dropdown';
import { GNB } from '@/src/components/GNB';
import { InputBox } from '@/src/components/InputBox';
import { SavingOverlay } from '@/src/components/SavingOverlay';
import { TextAreaBox } from '@/src/components/TextAreaBox';
import { IToastMessage, ToastMessage } from '@/src/components/ToastMessage';
import { today } from '@/src/utils/date';
import { useEffect, useState } from 'react';
import { HepaFilterNames, HepaFilterType } from '../../../companies/edit/[id]';
import { Checkbox } from '@/src/components/Checkbox';
import { fetchHepaFiltersWithCompanyId } from '@/src/utils/supabase/hepaFilters';
import {
	fetchManagementRecordById,
	updateManagementRecord,
} from '@/src/utils/supabase/managementRecord';
import {
	fetchHepaResultsByRecordId,
	updateHepaResultsViaRpc,
} from '@/src/utils/supabase/hepaResults';
import { fetchCompanyOptions } from '@/src/utils/supabase/company';
import { useRouter } from 'next/router';
import { DropdownSearchable } from '@/src/components/DropdownSearchable';
import { usePathname } from 'next/navigation';

export interface IHEPAResult {
	id?: string;
	companyId: string;
	managementRecordId?: string;
	filterType: HepaFilterType;
	width: number;
	height: number;
	depth: number;
	quantity: number;
	confirm: boolean;
}

function AdminManagementRecordsEditHepaPage() {
	const [hepaResults, setHepaResults] = useState<IHEPAResult[]>([]);

	const [date, setDate] = useState<Date>(today);
	const [companyId, setCompanyId] = useState('');
	const [manager, setManager] = useState('');
	const [comment, setComment] = useState('');

	const [companyOptions, setCompanyOptions] = useState<Option[]>([]);
	const [saving, setSaving] = useState(false);
	const [toastMessage, setToastMessage] = useState<IToastMessage>();

	const router = useRouter();
	const pathname = usePathname();
	const recordId = pathname?.split('/').at(5);

	useEffect(() => {
		getSetCompanyOptions();
	}, []);

	useEffect(() => {
		if (recordId) {
			getSetManagementRecordAndResult(recordId);
		}
	}, [recordId]);

	const getSetManagementRecordAndResult = async (recordId: string) => {
		try {
			const recordInfo = await fetchManagementRecordById(recordId);
			if (recordInfo) {
				// store에 있다고 가정한 필드명에 맞게 세팅
				setDate(new Date(recordInfo.date));
				setCompanyId(recordInfo.company_id);
				setManager(recordInfo.manager_name ?? '');

				setComment(recordInfo.comment ?? '');

				getSetHepaResults(recordInfo.id);
			}
		} catch (error) {
			console.error(error);
			setToastMessage({ status: 'error', message: '데이터 로드 실패' });
		}
	};

	const onSelectCompany = (companyId: string) => {
		setCompanyId(companyId);
		if (companyId) {
			getSetHepaFiltersandInitResults(companyId);
		} else {
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
					filterType: row.filter_type as HepaFilterType,
					width: row.width,
					height: row.height,
					depth: row.depth,
					quantity: row.quantity,
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

	const getSetHepaFiltersandInitResults = async (companyId: string) => {
		try {
			const data = await fetchHepaFiltersWithCompanyId(companyId);
			setHepaResults(
				(data ?? []).map((filter) => ({
					companyId,
					filterType: filter.filter_type as HepaFilterType,
					width: filter.width,
					height: filter.height,
					depth: filter.depth,
					quantity: filter.quantity,
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

	const onClickFilterConfirm = (row: IHEPAResult) => {
		setHepaResults((prev) =>
			prev.map((res) =>
				res === row
					? {
							...res,
							confirm: !res.confirm,
						}
					: res
			)
		);
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

	const handleUpdate = async () => {
		if (!companyId || !manager) {
			setToastMessage({
				status: 'warning',
				message: '필수 값들을 입력해주세요',
			});
			return;
		}
		if (!recordId) {
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
				recordId,
				companyId,
				date,
				manager,
				comment,
				'hepa'
			);

			// 2) hepa_results update
			const hepaResultsWithIds = hepaResults.map((r) => ({
				id: r.id,
				company_id: companyId,
				management_record_id: recordId,
				filter_type: r.filterType,
				width: r.width,
				height: r.height,
				depth: r.depth,
				quantity: r.quantity,
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
			field: 'filterType',
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
						onClick={() => onClickFilterConfirm(row as IHEPAResult)}
						checked={(row as IHEPAResult).confirm}
					/>
				);
			},
		},
	];

	return (
		<div>
			<GNB />

			<div className='flex flex-col bg-Gray-100 min-h-screen pt-[60px] md:pt-0'>
				<div className='flex justify-between items-center px-6 py-4 bg-white'>
					<p className='text-Gray-900 heading-md'>
						HEPA 필터 교체 기록
					</p>
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
									label='시행일'
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
								<div className='w-full overflow-x-auto'>
									<Table
										columns={columns}
										rows={hepaResults}
									/>
								</div>
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

export default AdminManagementRecordsEditHepaPage;
