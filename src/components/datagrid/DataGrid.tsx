import { useState } from 'react';
import { Table, TableProps } from './Table';
import { Pagination, PaginationProps } from './Pagination';

interface DataGridProps extends TableProps, PaginationProps {
	totalRows: number;
	pageSize: number;
}

export const PAGE_SIZE = 10;

export function DataGrid(props: DataGridProps) {
	const totalPages = Math.ceil(props.totalRows / props.pageSize);

	const startIdx = (props.currentPage) * props.pageSize;
	const endIdx = Math.min(startIdx + props.pageSize, props.totalRows);

	return (
		<div className='w-full flex flex-col'>
			<div className='w-full overflow-x-auto'>
				<Table
					columns={props.columns}
					rows={props.rows}
					onClickRow={props.onClickRow}
					headerStyle={props.headerStyle}
				/>
			</div>
			<div className='flex items-center justify-between p-6 bg-white'>
				<p className='text-Gray-500 body-sm-regular'>
					{`Showing ${startIdx + 1}-${endIdx} of ${props.totalRows}`}
				</p>
				<Pagination
					currentPage={props.currentPage}
					totalPages={totalPages}
					onPageChange={props.onPageChange}
				/>
			</div>
		</div>
	);
}
