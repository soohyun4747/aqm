import { Calendar } from '@/src/components/calendar/Calendar';
import { ISchedule, Schedule } from '@/src/components/calendar/Shedule';
import { CalendarTopbar } from '@/src/components/CalendarTopbar';
import { Card } from '@/src/components/Card';
import { GNB } from '@/src/components/GNB';
import { today } from '@/src/utils/date';
import { useMemo, useState } from 'react';
import { fetchSchedulesByMonthClient } from '../../../utils/supabse/schedule';
import { ScheduleAddModal } from '../../../components/modals/ScheduleAddModal';
import {
	ToastMessage,
	ToastMessageStatusType,
} from '../../../components/ToastMessage';

export type ViewType = 'calendar' | 'list';

function AdminCalendarPage() {
	const [year, setYear] = useState(today.getFullYear());
	const [month, setMonth] = useState(today.getMonth());

	const [monthSchedules, setMonthSchedules] = useState<ISchedule[]>([]);
	const [needToSchedules, setNeedToSchedules] = useState<ISchedule[]>([]);

	const [view, setView] = useState<ViewType>('calendar');

	const [scheduleAddModalOpen, setScheduleAddModalOpen] = useState(false);

	const [toastMessage, setToastMessage] = useState<{
		status: ToastMessageStatusType;
		message: string;
	}>();

	const getSetMonthSchedules = async () => {
		const data = await fetchSchedulesByMonthClient(year, month);
		setMonthSchedules(data.rows);
	};

	const requestedSchedules = useMemo(() => {
		return monthSchedules.filter(
			(schedule) => schedule.scheduleType === 'requested'
		);
	}, [monthSchedules]);

	const upcomingRequestedSchedules = useMemo(() => {
		const now = today;
		const fourWeeksLater = new Date(now);
		fourWeeksLater.setDate(now.getDate() + 28);

		return requestedSchedules.filter((schedule) => {
			const scheduleDate = new Date(schedule.date);
			return scheduleDate >= now && scheduleDate <= fourWeeksLater;
		});
	}, [requestedSchedules]);

	const confirmedSchedules = useMemo(() => {
		return monthSchedules.filter(
			(schedule) => schedule.scheduleType === 'confirmed'
		);
	}, [monthSchedules]);

	const addNewSchedule = async (schedule: ISchedule) => {
		const data: any = await addNewSchedule(schedule);
		if (data?.error) {
			setToastMessage({
				message: '스케줄 추가를 실패하였습니다',
				status: 'error',
			});
			console.log(data.error);
		} else {
			// 같은 달 데이터 리프레시
			await getSetMonthSchedules();
		}

		// 모달 닫기
		setScheduleAddModalOpen(false);
	};

	return (
		<div className='flex flex-col'>
			<GNB />
			<CalendarTopbar
				year={year}
				month={month}
				onClickCalendarView={() => setView('calendar')}
				onClickListView={() => setView('list')}
				onClickToday={() => {
					setYear(today.getFullYear());
					setMonth(today.getMonth());
				}}
				onClickAddNewSchedule={() => setScheduleAddModalOpen(true)}
				onClickPrevMonth={() => {
					if (month === 0) {
						setYear(year - 1);
						setMonth(11);
					} else {
						setMonth(month - 1);
					}
				}}
				onClickNextMonth={() => {
					if (month === 11) {
						setYear(year + 1);
						setMonth(0);
					} else {
						setMonth(month + 1);
					}
				}}
			/>
			<div className='flex gap-4 p-6'>
				<Calendar
					year={year}
					month={month}
					schedules={monthSchedules}
				/>
				<div className='flex flex-col gap-4'>
					<Card>
						<div className='flex flex-col gap-6'>
							<p className='text-Gray-900 heading-md'>
								다가오는 일정
							</p>
							{upcomingRequestedSchedules.map((schedule) => (
								<Schedule {...schedule} />
							))}
						</div>
					</Card>
				</div>
			</div>
			{scheduleAddModalOpen && (
				<ScheduleAddModal
					onClose={() => setScheduleAddModalOpen(false)}
					onAdd={addNewSchedule}
				/>
			)}
			{toastMessage && (
				<ToastMessage
					status={toastMessage.status}
					message={toastMessage.message}
					setToastMessage={setToastMessage}
				/>
			)}
		</div>
	);
}

export default AdminCalendarPage;
