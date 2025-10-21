import { DataGrid, PAGE_SIZE } from '@/src/components/datagrid/DataGrid';
import { IToastMessage, ToastMessage } from '@/src/components/ToastMessage';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { useManagementRecordStore } from '@/src/stores/managementRecordStore';
import { GNB } from '@/src/components/GNB';
import { SearchField } from '@/src/components/SearchField';
import { Button } from '@/src/components/buttons/Button';
import { Modal } from '@/src/components/modal/Modal';
import {
	deleteManagementRecord,
	fetchManagementRecords,
} from '@/src/utils/supabase/managementRecord';
import { Radio } from '@/src/components/Radio';
import { toLocaleStringWithoutSec } from '@/src/utils/date';
import {
	serviceNames,
	Services,
	ServiceType,
} from '@/src/utils/supabase/companyServices';
import { useScreenTypeStore } from '@/src/stores/screenTypeStore';

export interface IManagementRecord {
	id: string;
	companyId: string;
	companyName: string;
	date: string;
	managerName: string;
	serviceType: ServiceType;
	comment?: string;
	createdAt?: string;
	updatedAt?: string;
}

function AdminManagementRecordsPage() {
	const [managementRecords, setManagementRecords] = useState<
		IManagementRecord[]
	>([]);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [search, setSearch] = useState(''); // 검색어(선택)

	const [currentPage, setCurrentPage] = useState(0); // 0-based
	const [totalRows, setTotalRows] = useState(0);
	const [toastMessage, setToastMessage] = useState<IToastMessage>();
	const [serviceChooseModalOpen, setServiceChooseModalOpen] = useState(false);
	const [selectedServiceType, setSelectedServiceType] =
		useState<ServiceType>();

	const { managementRecord, setManagementRecord } =
		useManagementRecordStore();
	const screenType = useScreenTypeStore((state) => state.screenType);

	const router = useRouter();

	const totalPages = useMemo(
		() => Math.max(1, Math.ceil(totalRows / PAGE_SIZE)),
		[totalRows]
	);

	useEffect(() => {
		getSetManagementRecords(0);
	}, [search]);

	const getSetManagementRecords = async (page: number) => {
		try {
			const data = await fetchManagementRecords(page, search);

			if (data) {
				setManagementRecords(
					data.rows.map((row) => ({
						id: row.id,
						companyId: row.company_id,
						companyName: row.company_name,
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

	const onCloseDeleteModal = () => {
		setDeleteModalOpen(false);
		setManagementRecord(undefined);
	};

	return (
		<div>
			<GNB />
			<div className='flex flex-col bg-Gray-100 min-h-screen pt-[60px] md:pt-0'>
				<div className='flex items-center justify-center p-6'>
					<div
						style={{
							boxShadow:
								'0 1px 3px 0 rgba(0, 0, 0, 0.10), 0 1px 2px -1px rgba(0, 0, 0, 0.10)',
						}}
						className='flex flex-col self-stretch rounded-[8px] bg-white w-full'>
						<div className='flex md:flex-row flex-col justify-between md:items-center p-4 gap-2'>
							<p className='text-Gray-900 md:heading-sm body-lg-semibold'>
								관리 목록
							</p>
							<div className='flex items-center gap-3'>
								<SearchField
									searchValue={search}
									onChange={(e) => setSearch(e.target.value)}
								/>
								<Button
									onClick={() =>
										setServiceChooseModalOpen(true)
									}>
									{screenType === 'pc' ? '고객 추가' : '+'}
								</Button>
							</div>
						</div>
						<DataGrid
							onClickRow={(row) => {
								// setManagementRecord(row);
								router.push(
									`/admin/managementRecords/edit/${row.serviceType}/${row.id}`
								);
							}}
							totalRows={totalRows}
							pageSize={10}
							columns={[
								{
									field: 'companyName',
									headerName: '고객',
								},
								{ field: 'managerName', headerName: '관리자' },
								{
									field: 'date',
									headerName: '관리 날짜',
									render: (value) =>
										new Date(value).toLocaleDateString(),
								},
								{
									field: 'serviceType',
									headerName: '서비스',
									render: (value) => serviceNames[value],
								},
								{
									field: 'createdAt',
									headerName: '등록일',
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
													// setManagementRecord(row);
													router.push(
														`/admin/managementRecords/edit/${row.serviceType}/${row.id}`
													);
												}}>
												Edit
											</Button>
										);
									},
								},
								{
									field: 'action2',
									headerName: '',
									style: { width: 120 },
									render: (value, row: IManagementRecord) => {
										return (
											<Button
												variant='danger'
												onClick={() => {
													setManagementRecord(row);
													setDeleteModalOpen(true);
												}}>
												Delete
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
				{deleteModalOpen && (
					<Modal
						title='관리기록 삭제'
						onClose={onCloseDeleteModal}
						secondBtnProps={{
							variant: 'alternative',
							children: '취소',
							onClick: onCloseDeleteModal,
						}}
						firstBtnProps={{
							variant: 'danger',
							children: '삭제',
							onClick: async () => {
								if (managementRecord) {
									try {
										await deleteManagementRecord(
											managementRecord.id
										);
										onCloseDeleteModal();
										setToastMessage({
											status: 'confirm',
											message: '삭제가 완료되었습니다',
										});
										getSetManagementRecords(currentPage);
									} catch (e: any) {
										onCloseDeleteModal();
										console.error(e?.message);
										setToastMessage({
											status: 'error',
											message:
												'삭제 중 오류가 발생했습니다',
										});
									}
								}
							},
						}}>
						<p className='body-md-regular text-Gray-900'>
							관리기록을 정말로 삭제하시겠습니까?
						</p>
					</Modal>
				)}
				{serviceChooseModalOpen && (
					<Modal
						title='관리 유형'
						onClose={() => setServiceChooseModalOpen(false)}
						firstBtnProps={{
							children: '확인',
							onClick: () =>
								router.push(
									`/admin/managementRecords/edit/${selectedServiceType}`
								),
							disabled: selectedServiceType ? false : true,
						}}
						secondBtnProps={{
							children: '취소',
							variant: 'alternative',
							onClick: () => setServiceChooseModalOpen(false),
						}}>
						<div className='flex flex-col gap-4'>
							<p className='text-Gray-900 body-md-regular'>
								등록할 관리 유형을 선택하세요.
							</p>
							<Radio
								label={'AQM 검사'}
								onClick={() =>
									setSelectedServiceType(Services.aqm)
								}
								selected={selectedServiceType === Services.aqm}
							/>
							<Radio
								label={'HEPA 필터 교체'}
								onClick={() =>
									setSelectedServiceType(Services.hepa)
								}
								selected={selectedServiceType === Services.hepa}
							/>
							<Radio
								label={'VOC 필터 교체'}
								onClick={() =>
									setSelectedServiceType(Services.voc)
								}
								selected={selectedServiceType === Services.voc}
							/>
							<Radio
								label={'장비 설치 / AS'}
								onClick={() =>
									setSelectedServiceType(Services.as)
								}
								selected={selectedServiceType === Services.as}
							/>
						</div>
					</Modal>
				)}
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

export default AdminManagementRecordsPage;
