import { Card } from '@/src/components/Card';
import { Table, TableHeader } from '@/src/components/datagrid/Table';
import { GNB } from '@/src/components/GNB';
import { IToastMessage, ToastMessage } from '@/src/components/ToastMessage';
import { toLocaleStringWithoutSec } from '@/src/utils/date';
import { useEffect, useState } from 'react';
import { fetchVocResultsByRecordId } from '@/src/utils/supabase/vocResults';
import { vocFilterSpec } from '@/src/pages/admin/companies/edit/[id]';
import { Calendar } from '@/src/components/icons/Calendar';
import { fetchCompanyServicesByCompanyId } from '@/src/utils/supabase/companyServices';
import { IVOCResult } from '@/src/pages/admin/managementRecords/edit/voc/[id]';
import { usePathname } from 'next/navigation';
import {
	fetchManagementRecordById,
	IManagementRecordRow,
} from '@/src/utils/supabase/managementRecord';

function CompanyManagementRecordsEditVocPage() {
	const [vocResults, setVocResults] = useState<IVOCResult[]>([]);
	const [vocQuantity, setVocQuantity] = useState<number>();
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
				getSetVocQuantity(recordInfo.company_id);
			}
		} catch (error) {
			console.error(error);
			setToastMessage({ status: 'error', message: '데이터 로드 실패' });
		}
	};

	const getSetVocQuantity = async (companyId: string) => {
		const vocServiceData = await fetchCompanyServicesByCompanyId(
			companyId,
			'voc'
		);

		setVocQuantity(vocServiceData[0]?.quantity);
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

	const columns: TableHeader[] = [
		{
			field: 'filter_type',
			headerName: '필터 종류',
			render: () => 'VOC 필터',
		},
		{
			field: 'width',
			headerName: '가로',
			render: () => vocFilterSpec.width,
		},
		{
			field: 'height',
			headerName: '세로',
			render: () => vocFilterSpec.height,
		},
		{
			field: 'depth',
			headerName: '두께',
			render: () => vocFilterSpec.depth,
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
