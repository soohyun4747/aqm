import { CSSProperties } from 'react';

export interface TableProps {
	columns: TableHeader[];
	rows: any[];
	headerStyle?: CSSProperties;
	onClickRow?: (row: any) => void;
}

export interface TableHeader {
	field: string;
	headerName: string;
	style?: CSSProperties;
	render?: (value: any, row: any) => React.ReactNode;
}

export function Table(props: TableProps) {
	return (
		<table className='w-full h-full'>
			<thead>
				<tr className='text-left text-gray-600 text-[14px] font-medium'>
					{props.columns.map((col, i) => (
						<th
							style={{
								...props.headerStyle,
								...col.style,
							}}
							key={i}
							className={
								'p-4 bg-Gray-50 border-b border-Gray-200 h-[50px] items-center self-stretch'
							}>
							<p className='text-Gray-500 body-sm-medium'>
								{col.headerName}
							</p>
						</th>
					))}
				</tr>
			</thead>
			<tbody className='relative md:h-[200px]'>
				{props.rows.length > 0 ? (
					props.rows.map((row, i) => {
						return (
							<tr
								key={i}
								onClick={() =>
									props.onClickRow && props.onClickRow(row)
								}
								className={`${props.onClickRow && 'cursor-pointer'}`}>
								{props.columns.map((col, j) => {
									const element = col.render
										? col.render(row[col.field], row)
										: row[col.field];
									return (
										<td
											style={col.style}
											key={j}
											className={`md:p-4 px-4 py-2 bg-white border-b border-Gray-200 md:h-[54px] max-h-[24px] items-center self-stretch`}>
											{typeof element === 'string' ? (
												<p className='text-Gray-900 body-md-regular min-w-max'>
													{element}
												</p>
											) : (
												element
											)}
										</td>
									);
								})}
							</tr>
						);
					})
				) : (
					<tr className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[1/2]'>
						<td>
							<p className=' text-Gray-400 body-md-regular'>
								No data available
							</p>
						</td>
					</tr>
				)}
			</tbody>
		</table>
	);
}
