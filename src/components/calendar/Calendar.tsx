import { getMonthGrid, isToday } from '@/src/utils/date';
import { DateSection } from './DateSection';
import { useEffect, useState } from 'react';
import { ISchedule, Schedule } from './Schedule';
import { useScreenTypeStore } from '@/src/stores/screenTypeStore';

const weekLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export interface CalendarProps {
	year: number;
	month: number;
	schedules: ISchedule[];
}

export function Calendar(props: CalendarProps) {
	const [selectedDate, setSelectedDate] = useState<Date>();
	const [selectedDateSchedules, setSelectedDateSchedules] = useState<
		ISchedule[]
	>([]);

	const screenType = useScreenTypeStore((state) => state.screenType);

	useEffect(() => {
		//schedules filtered by selectedDate
		if (selectedDate) {
			const filtered = props.schedules.filter((schedule) => {
				return (
					schedule.scheduledAt.getFullYear() ===
						selectedDate.getFullYear() &&
					schedule.scheduledAt.getMonth() ===
						selectedDate.getMonth() &&
					schedule.scheduledAt.getDate() === selectedDate.getDate()
				);
			});
			setSelectedDateSchedules(filtered);
		} else {
			setSelectedDateSchedules([]);
		}
	}, [selectedDate]);

	return (
		<div className='flex flex-col flex-1'>
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
				{getMonthGrid(props.year, props.month).map((row) => {
					return (
						<div className='flex items-center'>
							{row.map((cell) => (
								<DateSection
									date={cell.date}
									value={cell.day}
									schedules={props.schedules.filter(
										(schedule) => {
											return (
												schedule.scheduledAt.getFullYear() ===
													cell.date.getFullYear() &&
												schedule.scheduledAt.getMonth() ===
													cell.date.getMonth() &&
												schedule.scheduledAt.getDate() ===
													cell.date.getDate()
											);
										}
									)}
									disabled={
										cell.inCurrentMonth ? false : true
									}
									selectedDate={selectedDate}
									onSelectDate={(date) =>
										setSelectedDate(date)
									}
								/>
							))}
						</div>
					);
				})}
			</div>
			{screenType === 'mobile' && (
				<div className='p-4 flex flex-col gap-3'>
					{selectedDateSchedules.map((schedule) => (
						<Schedule {...schedule} />
					))}
				</div>
			)}
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
