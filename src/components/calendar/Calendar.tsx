import { getMonthGrid, isToday } from '@/utils/date';
import { DateSection } from './DateSection';
import { useEffect, useState } from 'react';
import { ISchedule, Schedule } from './Shedule';
import { useScreenTypeStore } from '@/stores/screenTypeStore';

const weekLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export interface CalendarProps {
	year: number;
	month: number;
}

const today = new Date();

export function Calendar(props: CalendarProps) {
	const [selectedDate, setSelectedDate] = useState<Date>();
	const [selectedDateSchedules, setSelectedDateSchedules] = useState<
		ISchedule[]
	>([]); // ISchedule[]
	const [schedules, setSchedules] = useState<ISchedule[]>([
		{
			date: today,
			serviceType: 'aqm',
			scheduleType: 'confirmed',
			companyId: 'a',
		},
		{
			date: today,
			serviceType: 'hepa',
			scheduleType: 'requested',
			companyId: 'a',
		},
		{
			date: today,
			serviceType: 'hepa',
			scheduleType: 'requested',
			companyId: 'a',
		},
	]); // ISchedule[]

	const screenType = useScreenTypeStore((state) => state.screenType);

	useEffect(() => {
		//schedules filtered by selectedDate
		if (selectedDate) {
			const filtered = schedules.filter((schedule) => {
				return (
					schedule.date.getFullYear() ===
						selectedDate.getFullYear() &&
					schedule.date.getMonth() === selectedDate.getMonth() &&
					schedule.date.getDate() === selectedDate.getDate()
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
				{getMonthGrid(props.year, props.month).map((row) => (
					<div className='flex items-center'>
						{row.map((cell) => (
							<DateSection
								date={cell.date}
								value={cell.day}
								schedules={schedules.filter((schedule) => {
									return (
										schedule.date.getFullYear() ===
											cell.date.getFullYear() &&
										schedule.date.getMonth() ===
											cell.date.getMonth() &&
										schedule.date.getDate() ===
											cell.date.getDate()
									);
								})}
								disabled={cell.inCurrentMonth ? false : true}
								selectedDate={selectedDate}
								onSelectDate={(date) => setSelectedDate(date)}
							/>
						))}
					</div>
				))}
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
