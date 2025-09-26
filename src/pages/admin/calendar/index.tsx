import { Calendar } from '@/src/components/calendar/Calendar';
import { ISchedule, Schedule } from '@/src/components/calendar/Schedule';
import { CalendarTopbar } from '@/src/components/CalendarTopbar';
import { Card } from '@/src/components/Card';
import { GNB } from '@/src/components/GNB';
import { today } from '@/src/utils/date';
import { useEffect, useMemo, useState } from 'react';
import {
	createSchedule,
	deleteSchedule,
	fetchSchedulesByMonth,
	updateSchedule,
} from '../../../utils/supabase/schedule';
import {
	IToastMessage,
	ToastMessage,
	ToastMessageStatusType,
} from '../../../components/ToastMessage';
import {
	useScheduleDeleteModalOpenStore,
	useScheduleDetailModalOpenStore,
	useScheduleEditModalOpenStore,
} from '@/src/stores/modalOpenStore';
import { useSelectedScheduleStore } from '@/src/stores/selectedScheduleStore';
import { ScheduleAddModal } from '@/src/components/modals/ScheduleAddModal';
import { ScheduleDetailModal } from '@/src/components/modals/ScheduleDetailModal';
import { ScheduleEditModal } from '@/src/components/modals/ScheduleEditModal';
import { Modal } from '@/src/components/modal/Modal';
import { ListView } from '@/src/components/ListView';

export type ViewType = 'calendar' | 'list';

function AdminCalendarPage() {
	const [year, setYear] = useState(today.getFullYear());
	const [month, setMonth] = useState(today.getMonth());

	const [monthSchedules, setMonthSchedules] = useState<ISchedule[]>([]);
	const [needToSchedules, setNeedToSchedules] = useState<ISchedule[]>([]);

	const [view, setView] = useState<ViewType>('calendar');
	const [scheduleAddModalOpen, setScheduleAddModalOpen] = useState(false);
	const [toastMessage, setToastMessage] = useState<IToastMessage>();

	const { open: scheduleEditModalOpen, setOpen: setScheduleEditModalOpen } =
		useScheduleEditModalOpenStore();
	const {
		open: scheduleDetailModalOpen,
		setOpen: setScheduleDetailModalOpen,
	} = useScheduleDetailModalOpenStore();
	const { schedule, setSchedule } = useSelectedScheduleStore();
	const {
		open: scheduleDeleteModalOpen,
		setOpen: setScheduleDeleteModalOpen,
	} = useScheduleDeleteModalOpenStore();

	useEffect(() => {
		getSetMonthSchedules();
	}, [year, month]);

	const getSetMonthSchedules = async () => {
		const data = await fetchSchedulesByMonth(year, month);
		setMonthSchedules(data.rows);
	};

	const requestedSchedules = useMemo(() => {
		return monthSchedules.filter(
			(schedule) => schedule.status === 'requested'
		);
	}, [monthSchedules]);

	const confirmedSchedules = useMemo(() => {
		return monthSchedules.filter(
			(schedule) => schedule.status === 'confirmed'
		);
	}, [monthSchedules]);

	const upcomingConfirmedSchedules = useMemo(() => {
		const now = today;
		const fourWeeksLater = new Date(now);
		fourWeeksLater.setDate(now.getDate() + 28);

		return confirmedSchedules.filter((schedule) => {
			const scheduleDate = new Date(schedule.scheduledAt);
			return scheduleDate >= now && scheduleDate <= fourWeeksLater;
		});
	}, [confirmedSchedules]);

	const addNewSchedule = async (schedule: ISchedule) => {
		const data: any = await createSchedule(schedule);
		if (data?.error) {
			setToastMessage({
				message: '스케줄 추가를 실패하였습니다',
				status: 'error',
			});
			console.log(data.error);
		} else {
			// 같은 달 데이터 리프레시
			await getSetMonthSchedules();
			setToastMessage({
				status: 'confirm',
				message: '스케줄을 생성하였습니다',
			});
		}

		// 모달 닫기
		setScheduleAddModalOpen(false);
	};

	const onEditSchedule = async (schedule: ISchedule) => {
		try {
			await updateSchedule({ ...schedule, status: 'confirmed' });
			getSetMonthSchedules();
			setScheduleEditModalOpen(false);
			setScheduleDetailModalOpen(false);
			setToastMessage({
				status: 'confirm',
				message: '일정을 수정 확정하였습니다',
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

	const onConfirmSchedule = async (schedule: ISchedule) => {
		try {
			await updateSchedule({ ...schedule, status: 'confirmed' });
			getSetMonthSchedules();
			setScheduleDetailModalOpen(false);
			setToastMessage({
				status: 'confirm',
				message: '일정을 확정하였습니다',
			});
		} catch (error) {
			setScheduleDetailModalOpen(false);
			setToastMessage({
				status: 'error',
				message: '일정 확정을 실패하였습니다',
			});
			console.error(error);
		}
	};

	const onDeleteSchedule = async () => {
		if (schedule?.id) {
			try {
				await deleteSchedule(schedule.id);
				//이메일 전송 코드 추가
				getSetMonthSchedules();
				setScheduleDeleteModalOpen(false);
				setScheduleDetailModalOpen(false);
				setToastMessage({
					status: 'confirm',
					message: '일정을 삭제하였습니다',
				});
			} catch (error) {
				console.error(error);
				setScheduleDeleteModalOpen(false);
				setToastMessage({
					status: 'error',
					message: '일정 삭제를 실패하였습니다',
				});
			}
		}
	};

	return (
		<div className='flex flex-col'>
			<GNB />
			<CalendarTopbar
				year={year}
				month={month}
				view={view}
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
			<div className='flex gap-4 p-6 min-h-[calc(100vh-151px)]'>
				{view === 'calendar' ? (
					<Calendar
						year={year}
						month={month}
						schedules={monthSchedules}
					/>
				) : (
					<ListView
						onConfirmSchedule={onConfirmSchedule}
						requestedSchedules={requestedSchedules}
						confirmedSchedules={confirmedSchedules}
					/>
				)}
				<div className='flex flex-col gap-4'>
					<Card>
						<div className='flex flex-col gap-6'>
							<p className='text-Gray-900 heading-md'>
								다가오는 일정
							</p>
							{upcomingConfirmedSchedules.map((schedule) => (
								<Schedule {...schedule} />
							))}
						</div>
					</Card>
					<Card>
						<div className='flex flex-col gap-6'>
							<p className='text-Gray-900 heading-md'>
								요청온 일정
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
					onAdd={addNewSchedule}
				/>
			)}
			{scheduleDetailModalOpen && schedule && (
				<ScheduleDetailModal
					schedule={schedule}
					onClose={() => setScheduleDetailModalOpen(false)}
					onConfirm={onConfirmSchedule}
				/>
			)}
			{scheduleEditModalOpen && schedule && (
				<ScheduleEditModal
					schedule={schedule}
					onClose={() => setScheduleEditModalOpen(false)}
					onEdit={onEditSchedule}
				/>
			)}
			{scheduleDeleteModalOpen && schedule && (
				<Modal
					onClose={() => setScheduleDeleteModalOpen(false)}
					title='일정 삭제'
					firstBtnProps={{
						variant: 'danger',
						children: '삭제',
						onClick: onDeleteSchedule,
					}}>
					<>해당 일정을 삭제하시겠습니까?</>
				</Modal>
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
