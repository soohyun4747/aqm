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
import { useManagementRecordStore } from '@/src/stores/managementRecordStore';
import { today } from '@/src/utils/date';
import { useEffect, useState } from 'react';
import { Checkbox } from '@/src/components/Checkbox';
import {
        createManagementRecord,
        fetchManagementRecordById,
        updateManagementRecord,
} from '@/src/utils/supabase/managementRecord';
import { fetchCompanyOptions } from '@/src/utils/supabase/company';
import { useRouter } from 'next/router';
import {
        createVocResults,
        fetchVocResultsByRecordId,
        IVOCResultRow,
        updateVocResults,
} from '@/src/utils/supabase/vocResults';
import { fetchVocFiltersByCompanyId } from '@/src/utils/supabase/vocFilters';
import { DropdownSearchable } from '@/src/components/DropdownSearchable';
import { usePathname } from 'next/navigation';
import {
        VocFilterLabels,
        VocFilterType,
        defaultVocFilterType,
        getVocFilterSpec,
} from '@/src/constants/vocFilters';

export interface IVOCResult {
	id?: string;
	companyId: string;
	managementRecordId?: string;
	confirm: boolean;
}

function AdminManagementRecordsEditVocPage() {
        const [vocResults, setVocResults] = useState<IVOCResult[]>([]);
        const [vocFilterType, setVocFilterType] =
                useState<VocFilterType>(defaultVocFilterType);
        const [vocQuantity, setVocQuantity] = useState<number>(0);

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
				setDate(new Date(recordInfo.date));
				setCompanyId(recordInfo.company_id);
				setManager(recordInfo.manager_name ?? '');

				setComment(recordInfo.comment ?? '');

                                getSetVocResults(recordInfo.id);
                                getSetVocFilter(recordInfo.company_id);
			}
		} catch (error) {
			console.error(error);
			setToastMessage({ status: 'error', message: '데이터 로드 실패' });
		}
	};

	const onSelectCompany = (companyId: string) => {
		setCompanyId(companyId);
		if (companyId) {
			getSetInitVocResults(companyId);
		} else {
			setVocResults([]);
		}
	};

	const getSetVocResults = async (recordId: string) => {
		try {
			const data = await fetchVocResultsByRecordId(recordId);

			const mapped: IVOCResult[] =
				(data ?? []).map((row) => ({
					id: row.id,
					companyId: row.company_id,
					managementRecordId: row.management_record_id,
					confirm: row.confirm,
				})) ?? [];
			setVocResults(mapped);
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

        const getSetVocFilter = async (companyId: string) => {
                const vocFilters = await fetchVocFiltersByCompanyId(companyId);
                const filter = vocFilters?.[0];
                const type = (filter?.filter_type as VocFilterType) ?? defaultVocFilterType;
                const quantity = filter?.quantity ?? 0;

                setVocFilterType(type);
                setVocQuantity(quantity);

                return { type, quantity };
        };

        const getSetInitVocResults = async (companyId: string) => {
                try {
                        const { quantity } = await getSetVocFilter(companyId);
                        const count = Math.max(1, Number(quantity) || 0);
                        setVocResults(
                                Array.from({ length: count }, (_, idx) => ({
                                        id: `new-${idx}`,
                                        companyId,
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

	const onClickFilterConfirm = (row: IVOCResult) => {
		setVocResults((prev) => {
			if (prev) {
				const result = prev.find((res) => res.id === row.id);
				if (result) {
					result.confirm = !result.confirm;
					return JSON.parse(JSON.stringify(prev));
				}
			}
		});
	};

	const onClickAllCheck = () => {
		setVocResults((prev) => {
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
				serviceType: 'voc',
			});

			const managementRecordId = newManagementRecord.id;

			// 2) voc_results 일괄 insert (현재 상태 전체 저장)
			const vocResultsWithIds: IVOCResultRow[] = vocResults.map((r) => ({
				company_id: companyId,
				management_record_id: managementRecordId,
				confirm: r.confirm,
			}));

			if (vocResultsWithIds.length > 0) {
				await createVocResults(vocResultsWithIds);
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
				'voc'
			);

			// 2) voc_results update
			const vocResultsWithIds = vocResults.map((r) => ({
				id: r.id,
				company_id: companyId,
				management_record_id: recordId,
				confirm: r.confirm,
			}));
			if (vocResultsWithIds.length > 0) {
				await updateVocResults(vocResultsWithIds);
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

        const vocSpec = getVocFilterSpec(vocFilterType);

        const columns: TableHeader[] = [
                {
                        field: 'filter_type',
                        headerName: '필터 종류',
                        render: () => VocFilterLabels[vocFilterType],
                },
                {
                        field: 'width',
                        headerName: '가로',
                        render: () => vocSpec.width,
                },
                {
                        field: 'height',
                        headerName: '세로',
                        render: () => vocSpec.height,
                },
                {
                        field: 'depth',
                        headerName: '두께',
                        render: () => vocSpec.depth,
                },
		{
			field: 'quantity',
			headerName: '개수',
			render: () => vocQuantity,
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
							vocResults.find((res) => res.id === row.id)?.confirm
						}
					/>
				);
			},
		},
	];

	return (
		<div>
			<GNB />
			<div className='flex flex-col bg-Gray-100 min-h-screen md:pt-0 pt-[60px] md:pt-0'>
				<div className='flex justify-between items-center px-6 py-4 bg-white'>
					<p className='text-Gray-900 heading-md'>
						VOC 필터 교체 기록
					</p>
					<Button
						onClick={
							recordId ? handleUpdate : handleNewSave
						}
						disabled={saving}>
						{saving ? '저장 중…' : '저장하기'}
					</Button>
				</div>

				<div className='p-6 flex flex-col md:flex-row gap-4'>
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
										rows={vocResults}
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

export default AdminManagementRecordsEditVocPage;
