import { DataGrid, PAGE_SIZE } from '@/src/components/datagrid/DataGrid';
import { IToastMessage, ToastMessage } from '@/src/components/ToastMessage';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { useManagementRecordStore } from '@/src/stores/managementRecordStore';
import { GNB } from '@/src/components/GNB';
import { SearchField } from '@/src/components/SearchField';
import { Button } from '@/src/components/buttons/Button';
import { fetchManagementRecordsByCompany } from '@/src/utils/supabase/managementRecord';
import { useUserStore } from '@/src/stores/userStore';
import { toLocaleStringWithoutSec } from '@/src/utils/date';
import {
	serviceNames,
	ServiceType,
} from '@/src/utils/supabase/companyServices';

export interface IManagementRecord {
	id: string;
	companyId: string;
	companyName: string;
	date: string;
	managerName: string;
	serviceType: ServiceType;
	createdAt?: string;
	updatedAt?: string;
}

function CompanyManagementRecordsPage() {
	const [managementRecords, setManagementRecords] = useState<
		IManagementRecord[]
	>([]);
	const [search, setSearch] = useState('');
	const [currentPage, setCurrentPage] = useState(0); // 0-based
	const [totalRows, setTotalRows] = useState(0);
	const [toastMessage, setToastMessage] = useState<IToastMessage>();

	const router = useRouter();

	const totalPages = useMemo(
		() => Math.max(1, Math.ceil(totalRows / PAGE_SIZE)),
		[totalRows]
	);
	const user = useUserStore((state) => state.user);

	useEffect(() => {
		if (!user) return;
		getSetManagementRecords(0);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user, search]);

	const getSetManagementRecords = async (page: number) => {
		if (!user?.company) return;
		try {
			const data = await fetchManagementRecordsByCompany(
				user.company.id,
				page,
				search
			);
			if (data) {
				setManagementRecords(
					(data.rows ?? []).map((row: any) => ({
						id: row.id,
						companyId: row.company_id,
						companyName: row.company_name, // 뷰에 따라 존재 안 할 수 있음
						date: row.date,
						managerName: row.manager_name,
						serviceType: row.service_type as ServiceType,
						comment: row.comment,
						createdAt: row.created_at,
						updatedAt: row.updated_at,
					}))
				);
				setTotalRows(data.count ?? 0);
			}
		} catch (error) {
			console.error('Error fetching management records:', error);
			setToastMessage({
				status: 'error',
				message: '관리 기록을 가져오는 중 오류가 발생했습니다',
			});
		}
	};

	return (
		<div>
			<GNB />
			<div className='flex flex-col bg-Gray-100 h-screen pt-[60px] md:pt-0'>
				<div className='flex items-center justify-center p-6'>
					<div
						style={{
							boxShadow:
								'0 1px 3px 0 rgba(0, 0, 0, 0.10), 0 1px 2px -1px rgba(0, 0, 0, 0.10)',
						}}
						className='flex flex-col self-stretch rounded-[8px] bg-white w-full'>
						<div className='flex md:flex-row flex-col justify-between md:items-center p-4 gap-2'>
							<p className='text-Gray-900 heading-sm'>관리기록</p>
							<div className='flex items-center gap-3'>
								<SearchField
									searchValue={search}
									onChange={(e) => setSearch(e.target.value)}
								/>
							</div>
						</div>

						<DataGrid
							totalRows={totalRows}
							pageSize={PAGE_SIZE}
							onClickRow={(row) => {
								router.push(
									`/managementRecords/detail/${row.serviceType}/${row.id}`
								);
							}}
							columns={[
								{
									field: 'date',
									headerName: '시행일',
									render: (value) =>
										new Date(value).toLocaleDateString(),
								},
								{
									field: 'serviceType',
									headerName: '서비스',
									render: (value) => serviceNames[value],
								},
								{ field: 'managerName', headerName: '담당자' },
								{
									field: 'createdAt',
									headerName: '작성일',
									render: (value) =>
										toLocaleStringWithoutSec(
											new Date(value)
										),
								},
								{
									field: 'action',
									headerName: '',
									style: { width: 60 },
									render: (value, row: IManagementRecord) => {
										return (
											<Button
												variant='alternative'
												onClick={() => {
													router.push(
														`/managementRecords/detail/${row.serviceType}/${row.id}`
													);
												}}>
												상세보기
											</Button>
										);
									},
								},
							]}
							rows={managementRecords}
							currentPage={currentPage}
							totalPages={totalPages}
							onPageChange={(page: number) => {
								getSetManagementRecords(page);
								setCurrentPage(page);
							}}
						/>
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

export default CompanyManagementRecordsPage;
