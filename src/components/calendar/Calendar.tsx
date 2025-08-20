import { getMonthGrid, isToday } from '@/utils/date';
import { DateSection } from './DateSection';

const weekLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

interface CalendarProps {
	year: number;
	month: number;
}

const today = new Date();

export function Calendar(props: CalendarProps) {
	return (
		<div
			style={{
				boxShadow:
					'0 1px 3px 0 rgba(0, 0, 0, 0.10), 0 1px 2px -1px rgba(0, 0, 0, 0.10)',
			}}
			className='rounded-[8px]'>
			<div className='flex items-center'>
				{weekLabels.map((label, i) => (
					<DayLabel
						isFirst={i === 0 ? true : false}
						isLast={i === weekLabels.length - 1 ? true : false}
						day={label}
					/>
				))}
			</div>
			{getMonthGrid(props.year, props.month).map((row) => (
				<div className='flex items-center'>
					{row.map((cell) => (
						<DateSection
							value={cell.day}
							schedules={[
								{
									date: today,
									serviceType: 'aqm',
									scheduleType: 'confirmed',
								},
								{
									date: today,
									serviceType: 'hepa',
									scheduleType: 'requested',
								},
								{
									date: today,
									serviceType: 'hepa',
									scheduleType: 'requested',
								},
							]}
							disabled={cell.inCurrentMonth ? false : true}
							isToday={isToday(cell.date)}
						/>
					))}
				</div>
			))}
		</div>
	);
}

const DayLabel = ({
	isFirst,
	isLast,
	day,
}: {
	isFirst: boolean;
	isLast: boolean;
	day: string;
}) => {
	return (
		<div
			style={{
				borderTopLeftRadius: isFirst ? 8 : 0,
				borderTopRightRadius: isLast ? 8 : 0,
			}}
			className='border-r border-b border-Gray-100 bg-Gray-50 w-full p-2'>
			<p
				style={{ color: isFirst ? '#F05252' : '#111928' }}
				className='body-md-medium md:body-lg-medium w-full text-center'>
				{day}
			</p>
		</div>
	);
};
