import { Button } from '@/src/components/buttons/Button';
import { DataGrid, PAGE_SIZE } from '@/src/components/datagrid/DataGrid';
import { GNB } from '@/src/components/GNB';
import { SearchField } from '@/src/components/SearchField';
import { useSelectedCompanyStore } from '@/src/stores/selectedCompanyStore';
import { ICompany } from '@/src/stores/userStore';
import { fetchCompanies } from '@/src/utils/supabse/company';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

function AdminUsersPage() {
	const [companies, setCompanies] = useState<ICompany[]>([]);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [search, setSearch] = useState(''); // 검색어(선택)

	const [currentPage, setCurrentPage] = useState(0); // 0-based
	const [totalRows, setTotalRows] = useState(0);

	const [loading, setLoading] = useState(false);

	const setCompany = useSelectedCompanyStore((state) => state.setCompany);
	const router = useRouter();

	const totalPages = useMemo(
		() => Math.max(1, Math.ceil(totalRows / PAGE_SIZE)),
		[totalRows]
	);

	useEffect(() => {
		getSetCompanies(0);
	}, [search]);

	const getSetCompanies = async (page: number) => {
		setLoading(true);
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
		setLoading(false);
	};

	return (
		<div className='flex flex-col bg-Gray-100 h-screen'>
			<GNB />
			<div className='flex items-center justify-center p-6'>
				<div
					style={{
						boxShadow:
							'0 1px 3px 0 rgba(0, 0, 0, 0.10), 0 1px 2px -1px rgba(0, 0, 0, 0.10)',
					}}
					className='flex flex-col self-stretch rounded-[8px] bg-white w-full'>
					<div className='flex justify-between items-center p-4'>
						<p className='text-Gray-900 heading-sm'>고객 목록</p>
						<div className='flex items-center gap-3'>
							<SearchField
								searchValue={search}
								onChange={(e) => setSearch(e.target.value)}
							/>
							<Button
								onClick={() => router.push('/admin/users/edit')}>
								고객 추가
							</Button>
						</div>
					</div>
					<DataGrid
						// loading={loading}
						totalRows={0}
						pageSize={10}
						columns={[
							{ field: 'name', headerName: '고객' },
							{ field: 'email', headerName: '이메일' },
							{ field: 'phone', headerName: '전화번호' },
							{ field: 'address', headerName: '주소' },
							{
								field: 'action',
								headerName: '',
								render: (row: ICompany) => {
									return (
										<Button
											variant='alternative'
											onClick={() => {
												setCompany(row);
												router.push(
													'/admin/users/edit'
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
								render: (row: ICompany) => {
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
						onPageChange={(page: number) => getSetCompanies(page)}
					/>
				</div>
			</div>
		</div>
	);
}

export default AdminUsersPage;
