import { CSSProperties } from 'react';

interface DataGridProps {
	columns: DataGridHeader[];
	rows: any[];
	headerStyle?: CSSProperties;
}

export interface DataGridHeader {
	field: string;
	headerName: string;
	colSpan?: number;
	render?: (value: any, row: any) => React.ReactNode;
}

export function Table(props: DataGridProps) {
	<table>
		<thead>
			<tr className='text-left text-gray-600 text-[14px] font-medium'>
				{props.columns.map((col, i) => (
					<th
						style={{
							...props.headerStyle,
						}}
						key={i}
						className={
							'p-4 bg-Gray-50 border-b border-Gray-200 h-[50px] items-center self-stretch'
						}
						colSpan={col.colSpan}>
						<p className='text-Gray-500 body-sm-medium'>
							{col.headerName}
						</p>
					</th>
				))}
			</tr>
			<tbody>
				{props.rows.map((row) => (
					<>
						{props.columns.map((col, j) => (
							<td
								key={j}
								className={`p-4 bg-white border-b border-Gray-200 h-[54px] items-center self-stretch`}>
								<p className='text-Gray-900 body-md-regular'>
									{col.render
										? col.render(row[col.field], row)
										: row[col.field]}
								</p>
							</td>
						))}
					</>
				))}
			</tbody>
		</thead>
	</table>;
}
