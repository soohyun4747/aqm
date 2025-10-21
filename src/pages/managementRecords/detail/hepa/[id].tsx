import { Card } from '@/src/components/Card';
import { Table, TableHeader } from '@/src/components/datagrid/Table';
import { GNB } from '@/src/components/GNB';
import { IToastMessage, ToastMessage } from '@/src/components/ToastMessage';
import { useManagementRecordStore } from '@/src/stores/managementRecordStore';
import { toLocaleStringWithoutSec } from '@/src/utils/date';
import { useEffect, useState } from 'react';
import { fetchHepaFiltersWithCompanyId } from '@/src/utils/supabase/hepaFilters';
import { fetchHepaResultsByRecordId } from '@/src/utils/supabase/hepaResults';
import { IHEPAResult } from '@/src/pages/admin/managementRecords/edit/hepa/[id]';
import {
	HepaFilterNames,
	HepaFilterType,
	IHepaFilter,
} from '@/src/pages/admin/companies/edit/[id]';
import { Calendar } from '@/src/components/icons/Calendar';
import { usePathname } from 'next/navigation';
import {
	fetchManagementRecordById,
	IManagementRecordRow,
} from '@/src/utils/supabase/managementRecord';

function AdminManagementRecordsEditHepaPage() {
	const [hepaResults, setHepaResults] = useState<IHEPAResult[]>([]);
	const [hepaFilters, setHepaFilters] = useState<IHepaFilter[]>([]);

	const [toastMessage, setToastMessage] = useState<IToastMessage>();
	const [managementRecord, setManagementRecord] =
		useState<IManagementRecordRow>();

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
				getSetHepaResults(recordId);
				getSetHepaFilters(recordInfo.company_id);
			}
		} catch (error) {
			console.error(error);
			setToastMessage({ status: 'error', message: '데이터 로드 실패' });
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
			headerName: '교체 확인',
			render: (value, row) =>
				hepaResults?.find((res) => res.filterId === row.id)?.confirm
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
						HEPA 필터 교체 기록
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
										HEPA 필터 교체
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
										관리 날짜
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
										rows={hepaFilters}
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

export default AdminManagementRecordsEditHepaPage;
