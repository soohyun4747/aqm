import { Calendar } from '@/src/components/calendar/Calendar';
import { ISchedule, Schedule } from '@/src/components/calendar/Schedule';
import { CalendarTopbar } from '@/src/components/CalendarTopbar';
import { Card } from '@/src/components/Card';
import { GNB } from '@/src/components/GNB';
import { today } from '@/src/utils/date';
import { useEffect, useMemo, useState } from 'react';
import {
	createSchedule as createScheduleApi,
	fetchSchedulesByMonth,
} from '../../utils/supabase/schedule';
import { ScheduleAddModal } from '../../components/modals/ScheduleAddModal';
import { IToastMessage, ToastMessage } from '../../components/ToastMessage';
import { supabaseClient } from '@/lib/supabase/client';
import { IUser, useUserStore } from '@/src/stores/userStore';
import { User } from '@supabase/supabase-js';

export type ViewType = 'calendar' | 'list';

function CompanyCalendarPage() {
	// month는 0~11로 통일합니다 (JS Date 규약)
	const [year, setYear] = useState(today.getFullYear());
	const [month, setMonth] = useState(today.getMonth());

	const [monthSchedules, setMonthSchedules] = useState<ISchedule[]>([]);
	const [view, setView] = useState<ViewType>('calendar');
	const [scheduleAddModalOpen, setScheduleAddModalOpen] = useState(false);
	const [toastMessage, setToastMessage] = useState<IToastMessage>();
	const user = useUserStore((state) => state.user);

	useEffect(() => {
		if (user) {
			getSetMonthSchedules(user);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [year, month, user]);

	const getSetMonthSchedules = async (user: IUser) => {
		// companyId가 있으면 해당 회사 스코프, 없으면(=관리자) 전체
		const data = await fetchSchedulesByMonth(year, month, {
			companyId: user.company?.id,
		});
		setMonthSchedules(data.rows ?? []);
	};

	const now = today;
	const upcomingRequestedSchedules = useMemo(() => {
		const fourWeeksLater = new Date(now);
		fourWeeksLater.setDate(now.getDate() + 28);
		return monthSchedules.filter((s) => {
			const d = new Date(s.scheduledAt);
			return s.status === 'requested' && d >= now && d <= fourWeeksLater;
		});
	}, [monthSchedules, now]);

	const confirmedSchedules = useMemo(() => {
		return monthSchedules.filter((s) => s.status === 'confirmed');
	}, [monthSchedules]);

	const addNewSchedule = async (schedule: ISchedule, user: IUser) => {
		// 회사 사용자라면 company_id를 강제 세팅
		const payload = user.company
			? { ...schedule, company_id: user.company.id }
			: schedule;

		const data: any = await createScheduleApi(payload);
		if (data?.error) {
			setToastMessage({
				message: '스케줄 추가를 실패하였습니다',
				status: 'error',
			});
			console.log(data.error);
		} else {
			await getSetMonthSchedules(user);
			setToastMessage({
				status: 'confirm',
				message: '스케줄을 생성하였습니다',
			});
		}
		setScheduleAddModalOpen(false);
	};

	return (
		<div className='flex flex-col'>
			<GNB />
			<CalendarTopbar
				year={year}
				month={month} // 0~11 전달
				onClickCalendarView={() => setView('calendar')}
				onClickListView={() => setView('list')}
				onClickToday={() => {
					setYear(today.getFullYear());
					setMonth(today.getMonth()); // 0~11
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

					<Card>
						<div className='flex flex-col gap-6'>
							<p className='text-Gray-900 heading-md'>
								확정된 일정
							</p>
							{confirmedSchedules.map((schedule) => (
								<Schedule {...schedule} />
							))}
						</div>
					</Card>
				</div>
			</div>

			{/* {scheduleAddModalOpen && (
				<ScheduleAddModal
					onClose={() => setScheduleAddModalOpen(false)}
					onAdd={(schedule) => addNewSchedule(schedule, user)}
				/>
			)} */}
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

export default CompanyCalendarPage;
