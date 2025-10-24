import { Button } from '@/src/components/buttons/Button';
import { DataGrid, PAGE_SIZE } from '@/src/components/datagrid/DataGrid';
import { GNB } from '@/src/components/GNB';
import { Modal } from '@/src/components/modal/Modal';
import { SearchField } from '@/src/components/SearchField';
import { IToastMessage, ToastMessage } from '@/src/components/ToastMessage';
import { useLoadingStore } from '@/src/stores/loadingStore';
import { useScreenTypeStore } from '@/src/stores/screenTypeStore';
import { useSelectedCompanyStore } from '@/src/stores/selectedCompanyStore';
import { ICompany } from '@/src/stores/userStore';
import { deleteCompany, fetchCompanies } from '@/src/utils/supabase/company';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

function AdminUsersPage() {
	const [companies, setCompanies] = useState<ICompany[]>([]);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [search, setSearch] = useState(''); // 검색어(선택)

	const [currentPage, setCurrentPage] = useState(0); // 0-based
	const [totalRows, setTotalRows] = useState(0);
	const [toastMessage, setToastMessage] = useState<IToastMessage>();

	const { open: openLoading, close: closeLoading } = useLoadingStore();

	const { company, setCompany } = useSelectedCompanyStore();
	const router = useRouter();

	const screenType = useScreenTypeStore((state) => state.screenType);

	const totalPages = useMemo(
		() => Math.max(1, Math.ceil(totalRows / PAGE_SIZE)),
		[totalRows]
	);

	useEffect(() => {
		getSetCompanies(0);
	}, [search]);

	const getSetCompanies = async (page: number) => {
		const data = await fetchCompanies(page, search);
		if (data) {
			setCompanies(
				data.rows.map((row) => ({
					id: row.id,
					name: row.name,
					email: row.email ?? '',
					phone: row.phone ?? '',
					address: row.address ?? '',
					floorImagePath: row.floor_image_path ?? '',
				}))
			);
			setTotalRows(data.count ?? 0);
		}
	};

	const onCloseDeleteModal = () => {
		setDeleteModalOpen(false);
		setCompany(undefined);
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
								고객 목록
							</p>
							<div className='flex items-center gap-3'>
								<SearchField
									searchValue={search}
									onChange={(e) => setSearch(e.target.value)}
								/>
								<Button
									onClick={() =>
										router.push('/admin/companies/edit')
									}>
									{screenType === 'pc' ? '고객 추가' : '+'}
								</Button>
							</div>
						</div>
						<DataGrid
							onClickRow={(row) => {
								router.push(`/admin/companies/edit/${row.id}`);
							}}
							totalRows={totalRows}
							pageSize={10}
							columns={[
								{ field: 'name', headerName: '고객' },
								{ field: 'email', headerName: '이메일' },
								{ field: 'phone', headerName: '전화번호' },
								{ field: 'address', headerName: '주소' },
								{
									field: 'action',
									headerName: '',
									style: { width: 60 },
									render: (value, row: ICompany) => {
										return (
											<Button
												variant='alternative'
												onClick={() => {
													// setCompany(row);
													router.push(
														`/admin/companies/edit/${row.id}`
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
									render: (value, row: ICompany) => {
										return (
											<Button
												variant='danger'
												onClick={() => {
													setCompany(row);
													setDeleteModalOpen(true);
												}}>
												Delete
											</Button>
										);
									},
								},
							]}
							rows={companies}
							currentPage={currentPage}
							totalPages={totalPages}
							onPageChange={(page: number) => {
								getSetCompanies(page);
								setCurrentPage(page);
							}}
						/>
					</div>
				</div>
				{deleteModalOpen && (
					<Modal
						title='고객 삭제'
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
								if (company) {
									try {
										onCloseDeleteModal();
										openLoading();
										await deleteCompany(company.id);
										closeLoading();
										setToastMessage({
											status: 'confirm',
											message: '삭제가 완료되었습니다',
										});
										getSetCompanies(currentPage);
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
							고객 &quot;
							<span className='text-Red-600'>
								{company?.name}
							</span>
							&quot;를 삭제하시겠습니까?
							<br />
							관리 기록을 제외한 고객 데이터와 계정이 모두
							삭제됩니다.
						</p>
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

export default AdminUsersPage;
