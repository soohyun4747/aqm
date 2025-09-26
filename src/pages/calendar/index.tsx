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
	updateSchedule,
} from '../../utils/supabase/schedule';
import { IToastMessage, ToastMessage } from '../../components/ToastMessage';
import { IUser, useUserStore } from '@/src/stores/userStore';
import { ScheduleAddModal } from '@/src/components/modals/ScheduleAddModal';
import {
	useScheduleDetailModalOpenStore,
	useScheduleEditModalOpenStore,
} from '@/src/stores/modalOpenStore';
import { ScheduleDetailModal } from '@/src/components/modals/ScheduleDetailModal';
import { ScheduleEditModal } from '@/src/components/modals/ScheduleEditModal';
import { useSelectedScheduleStore } from '@/src/stores/selectedScheduleStore';


function CompanyCalendarPage() {
	// month는 0~11로 통일합니다 (JS Date 규약)
	const [year, setYear] = useState(today.getFullYear());
	const [month, setMonth] = useState(today.getMonth());

	const [monthSchedules, setMonthSchedules] = useState<ISchedule[]>([]);
	const [scheduleAddModalOpen, setScheduleAddModalOpen] = useState(false);

	const { open: scheduleEditModalOpen, setOpen: setScheduleEditModalOpen } =
		useScheduleEditModalOpenStore();
	const {
		open: scheduleDetailModalOpen,
		setOpen: setScheduleDetailModalOpen,
	} = useScheduleDetailModalOpenStore();
	const { schedule, setSchedule } = useSelectedScheduleStore();

	//modal 다 이쪽으로 빼기

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
	const upcomingSchedules = useMemo(() => {
		const fourWeeksLater = new Date(now);
		fourWeeksLater.setDate(now.getDate() + 28);
		return monthSchedules.filter((s) => {
			const d = new Date(s.scheduledAt);
			return s.status === 'confirmed' && d >= now && d <= fourWeeksLater;
		});
	}, [monthSchedules, now]);

	const requestedSchedules = useMemo(() => {
		return monthSchedules.filter((s) => s.status === 'requested');
	}, [monthSchedules]);

	const addNewSchedule = async (schedule: ISchedule, user?: IUser) => {
		if (user?.company) {
			// 회사 사용자라면 company_id를 강제 세팅
			const payload = { ...schedule, company_id: user.company.id };

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
					message: '스케줄을 요청하였습니다',
				});
			}
		} else {
			setToastMessage({
				message: '사용자 정보에 문제가 있습니다',
				status: 'error',
			});
		}
		setScheduleAddModalOpen(false);
	};

	const onEditSchedule = async (schedule: ISchedule) => {
		try {
			await updateSchedule({...schedule, status: 'requested'});
			if (user) {
				getSetMonthSchedules(user);
			}
			setScheduleEditModalOpen(false);
			setScheduleDetailModalOpen(false);
			setToastMessage({
				status: 'confirm',
				message: '일정을 수정 요청하였습니다',
			});
		} catch (error) {
			setScheduleEditModalOpen(false);
			setToastMessage({
				status: 'error',
				message: '일정 수정을 실패하였습니다',
			});
			console.error(error);
		}
	};

	return (
		<div className='flex flex-col'>
			<GNB />
			<CalendarTopbar
				year={year}
				month={month} // 0~11 전달
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
							{upcomingSchedules.map((schedule) => (
								<Schedule {...schedule} />
							))}
						</div>
					</Card>

					<Card>
						<div className='flex flex-col gap-6'>
							<p className='text-Gray-900 heading-md'>
								요청된 일정
							</p>
							{requestedSchedules.map((schedule) => (
								<Schedule {...schedule} />
							))}
						</div>
					</Card>
				</div>
			</div>

			{scheduleAddModalOpen && (
				<ScheduleAddModal
					onClose={() => setScheduleAddModalOpen(false)}
					onAdd={(schedule) => addNewSchedule(schedule, user)}
				/>
			)}
			{scheduleDetailModalOpen && schedule && (
				<ScheduleDetailModal
					schedule={schedule}
					onClose={() => setScheduleDetailModalOpen(false)}
				/>
			)}
			{scheduleEditModalOpen && schedule && (
				<ScheduleEditModal
					schedule={schedule}
					onClose={() => setScheduleEditModalOpen(false)}
					onEdit={onEditSchedule}
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

export default CompanyCalendarPage;
