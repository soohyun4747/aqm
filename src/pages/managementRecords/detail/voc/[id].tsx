import { Card } from '@/src/components/Card';
import { Table, TableHeader } from '@/src/components/datagrid/Table';
import { GNB } from '@/src/components/GNB';
import { IToastMessage, ToastMessage } from '@/src/components/ToastMessage';
import { toLocaleStringWithoutSec } from '@/src/utils/date';
import { useEffect, useState } from 'react';
import { fetchVocResultsByRecordId } from '@/src/utils/supabase/vocResults';
import { Calendar } from '@/src/components/icons/Calendar';
import { fetchVocFiltersByCompanyId } from '@/src/utils/supabase/vocFilters';
import { IVOCResult } from '@/src/pages/admin/managementRecords/edit/voc/[id]';
import { usePathname } from 'next/navigation';
import {
        fetchManagementRecordById,
        IManagementRecordRow,
} from '@/src/utils/supabase/managementRecord';
import {
        VocFilterLabels,
        VocFilterType,
        defaultVocFilterType,
        getVocFilterSpec,
} from '@/src/constants/vocFilters';

function CompanyManagementRecordsEditVocPage() {
        const [vocResults, setVocResults] = useState<IVOCResult[]>([]);
        const [vocFilterType, setVocFilterType] =
                useState<VocFilterType>(defaultVocFilterType);
        const [vocQuantity, setVocQuantity] = useState<number>(0);
	const [managementRecord, setManagementRecord] =
		useState<IManagementRecordRow>();

	const [toastMessage, setToastMessage] = useState<IToastMessage>();

	const pathname = usePathname();
	const recordId = pathname?.split('/').at(4);

	useEffect(() => {
		if (recordId) {
			getSetManagementRecordAndResult(recordId);
		}
	}, [recordId]);


	const getSetManagementRecordAndResult = async (recordId: string) => {
		try {
			const recordInfo = await fetchManagementRecordById(recordId);
			if (recordInfo) {
                                setManagementRecord(recordInfo);
                                getSetVocResults(recordInfo.id);
                                getSetVocFilter(recordInfo.company_id);
			}
		} catch (error) {
			console.error(error);
			setToastMessage({ status: 'error', message: '데이터 로드 실패' });
		}
	};

        const getSetVocFilter = async (companyId: string) => {
                const vocFilters = await fetchVocFiltersByCompanyId(companyId);
                const filter = vocFilters?.[0];
                const type = (filter?.filter_type as VocFilterType) ?? defaultVocFilterType;
                const quantity = filter?.quantity ?? 0;

                setVocFilterType(type);
                setVocQuantity(quantity);
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
			headerName: '교체 확인',
			render: (value, row) =>
				vocResults.find((res) => res.id === row.id)?.confirm
					? '완료'
					: '미완료',
		},
	];

	return (
		<div>
			<GNB />
			<div className='flex flex-col bg-Gray-100 min-h-screen pt-[60px] md:pt-0'>
				<div className='flex justify-between items-center px-6 py-4 bg-white'>
					<p className='text-Gray-900 heading-md'>
						VOC 필터 교체 기록
					</p>
				</div>

				<div className='p-6 flex md:flex-row flex-col gap-4'>
					<div className='flex flex-col gap-4 w-[330px]'>
						<Card>
							<div className='flex flex-col gap-[12px]'>
								<div className='flex flex-col gap-1'>
									<p className='text-Gray-900 body-lg-medium'>
										서비스
									</p>
									<p className='text-Gray-500 body-lg-regular'>
										VOC 필터 교체
									</p>
								</div>
								<div className='flex flex-col gap-1'>
									<p className='text-Gray-900 body-lg-medium'>
										관리자
									</p>
									<p className='text-Gray-500 body-lg-regular'>
										{managementRecord?.manager_name}
									</p>
								</div>
								<div className='flex flex-col'>
									<p className='text-Gray-900 body-lg-medium'>
										시행일
									</p>
									<div className='flex items-center gap-2'>
										<Calendar
											fill='#9CA3AF'
											size={12}
										/>
										<p className='text-Gray-500 body-lg-regular'>
											{managementRecord &&
												new Date(
													managementRecord?.date
												).toLocaleDateString()}
										</p>
									</div>
								</div>
								<div className='flex flex-col'>
									<p className='text-Gray-900 body-lg-medium'>
										등록일
									</p>
									<div className='flex items-center gap-2'>
										<Calendar
											fill='#9CA3AF'
											size={12}
										/>
										<p className='text-Gray-500 body-lg-regular'>
											{managementRecord?.created_at &&
												toLocaleStringWithoutSec(
													new Date(
														managementRecord.created_at
													)
												)}
										</p>
									</div>
								</div>
							</div>
						</Card>
						<Card className='flex-1'>
							<div className='flex flex-col gap-[6px]'>
								<p className='heading-md text-Gray-900'>
									코멘트
								</p>
								<p className='text-Gray-500 body-lg-regular'>
									{managementRecord?.comment}
								</p>
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
								</div>
								<div className='overflow-x-auto'>
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
			</div>
		</div>
	);
}

export default CompanyManagementRecordsEditVocPage;
