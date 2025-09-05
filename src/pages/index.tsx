import { Calendar } from '@/components/calendar/Calendar';
import { CalendarTopbar } from '@/components/CalendarTopbar';
import { Card } from '@/components/Card';
import { GNB } from '@/components/GNB';
import { today } from '@/utils/date';
import { useState } from 'react';

function MainPage() {
	const [year, setYear] = useState(today.getFullYear());
	const [month, setMonth] = useState(today.getMonth());

	return (
		<div className='flex flex-col'>
			<GNB />
			<CalendarTopbar
				year={year}
				month={month}
				onClickCalendarView={function (): void {
					throw new Error('Function not implemented.');
				}}
				onClickListView={function (): void {
					throw new Error('Function not implemented.');
				}}
				onClickToday={function (): void {
					throw new Error('Function not implemented.');
				}}
				onClickAddNewSchedule={function (): void {
					throw new Error('Function not implemented.');
				}}
				onClickPrevMonth={function (): void {
					throw new Error('Function not implemented.');
				}}
				onClickNextMonth={function (): void {
					throw new Error('Function not implemented.');
				}}
			/>
			<div className='flex gap-4 p-6'>
				<Calendar
					year={year}
					month={month}
				/>
				<div className='flex flex-col gap-4'>
					<Card
						content={
							<div className='flex flex-col gap-6'>
								<p className='text-Gray-900 heading-md'>
									다가오는 일정
								</p>
								<div className='flex flex-col gap-3'>
									<p></p>
								</div>
							</div>
						}
					/>
				</div>
			</div>
		</div>
	);
}

export default MainPage;
