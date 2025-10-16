import { Calendar } from '@/src/components/calendar/Calendar';
import { ScheduleCard } from '@/src/components/calendar/ScheduleCard';
import { CalendarTopbar } from '@/src/components/CalendarTopbar';
import { Card } from '@/src/components/Card';
import { GNB } from '@/src/components/GNB';
import { daysSince, today } from '@/src/utils/date';
import { useEffect, useMemo, useState } from 'react';
import {
	cancelSchedule,
	createSchedule,
	fetchConfirmedSchedulesWithin3WeeksByCompany,
	fetchLatestConfirmedSchedules,
	fetchRequestedSchedules,
	fetchSchedulesByMonth,
	ISchedule,
	updateSchedule,
} from '../../../utils/supabase/schedule';
import { IToastMessage, ToastMessage } from '../../../components/ToastMessage';
import {
	useScheduleAddModalOpenStore,
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
import {
	buildRequiredItems,
	filterRequired,
	formatOverdueLabel,
} from '@/src/utils/schedule';
import { ScheduleCardRequired } from '@/src/components/calendar/ScheduleCardRequired';
import { serviceNames } from '@/src/utils/supabase/companyServices';

export type ViewType = 'calendar' | 'list';

function AdminCalendarPage() {
	const [year, setYear] = useState(today.getFullYear());
	const [month, setMonth] = useState(today.getMonth());

	const [monthSchedules, setMonthSchedules] = useState<ISchedule[]>([]);
	const [requiredSchedules, setRequiredSchedules] = useState<ISchedule[]>([]);

	const [upcomingSchedules, setUpcomingSchedules] = useState<ISchedule[]>([]);
	const [requestedSchedules, setRequestedSchedules] = useState<ISchedule[]>(
		[]
	);

	const [view, setView] = useState<ViewType>('calendar');
	const [toastMessage, setToastMessage] = useState<IToastMessage>();

	const { open: scheduleAddModalOpen, setOpen: setScheduleAddModalOpen } =
		useScheduleAddModalOpenStore();
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
		getSetRequiredSchedules();
		getSetUpcomingSchedules();
		getSetRequestedSchedules();

		return () => {
			setSchedule(undefined);
		};
	}, []);

	useEffect(() => {
		getSetMonthSchedules();
	}, [year, month]);

	const reUpdateSchedules = () => {
		getSetMonthSchedules();
		getSetRequiredSchedules();
		getSetUpcomingSchedules();
		getSetRequestedSchedules();
	};

	const getSetUpcomingSchedules = async () => {
		try {
			const data = await fetchConfirmedSchedulesWithin3WeeksByCompany();
			setUpcomingSchedules(data.rows);
		} catch (error) {
			console.error(error);
		}
	};

	const getSetRequestedSchedules = async () => {
		try {
			const data = await fetchRequestedSchedules();
			setRequestedSchedules(data.rows);
		} catch (error) {
			console.error(error);
		}
	};

	const getSetRequiredSchedules = async () => {
		try {
			const latest = await fetchLatestConfirmedSchedules();
			const now = new Date();
			const items = buildRequiredItems(latest, now);
			const targets = filterRequired(items, now);

			const mapped = targets
				.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()) // 기한 임박순
				.map((it) => ({
					id: `${it.companyId}-${
						it.serviceType
					}-due-${it.dueDate.toISOString()}`,
					companyId: it.companyId,
					companyName: it.companyName,
					serviceType: it.serviceType,
					status: 'required',
					title: serviceNames[it.serviceType],
					delayedLabel:
						it.lastConfirmedAt &&
						formatOverdueLabel(
							daysSince(it.lastConfirmedAt, { inclusive: true })
						),
					//delayed: 연체된 경우 연체된 일수, 개월수 등 표시,
					scheduledAt: it.lastConfirmedAt, // 기한을 날짜로 노출
					createdAt: now,
					updatedAt: now,
				}));

			setRequiredSchedules(mapped as ISchedule[]);
		} catch (e) {
			console.error('Error building required schedules:', e);
			setRequiredSchedules([]);
		}
	};

	const getSetMonthSchedules = async () => {
		const data = await fetchSchedulesByMonth(year, month);
		setMonthSchedules(data.rows);
	};

	const monthRequestedSchedules = useMemo(() => {
		return monthSchedules.filter(
			(schedule) => schedule.status === 'requested'
		);
	}, [monthSchedules]);

	const monthConfirmedSchedules = useMemo(() => {
		return monthSchedules.filter(
			(schedule) => schedule.status === 'confirmed'
		);
	}, [monthSchedules]);

	const monthCancelledSchedules = useMemo(() => {
		return monthSchedules.filter(
			(schedule) => schedule.status === 'cancelled'
		);
	}, [monthSchedules]);

	const addNewSchedule = async (schedule: ISchedule) => {
		setScheduleAddModalOpen(false);
		const data: any = await createSchedule(schedule);
		// 모달 닫기
		if (data?.error) {
			setToastMessage({
				message: '스케줄 추가를 실패하였습니다',
				status: 'error',
			});
			console.log(data.error);
		} else {
			// 같은 달 데이터 리프레시
			reUpdateSchedules();
			setToastMessage({
				status: 'confirm',
				message: '스케줄을 생성하였습니다',
			});
		}
	};

	const onEditSchedule = async (schedule: ISchedule) => {
		setScheduleEditModalOpen(false);
		setScheduleDetailModalOpen(false);
		try {
			await updateSchedule({ ...schedule, status: 'confirmed' });
			reUpdateSchedules();
			setToastMessage({
				status: 'confirm',
				message: '일정을 수정 확정하였습니다',
			});
		} catch (error) {
			setToastMessage({
				status: 'error',
				message: '일정 수정을 실패하였습니다',
			});
			console.error(error);
		}
	};

	const onConfirmSchedule = async (schedule: ISchedule) => {
		setScheduleDetailModalOpen(false);
		try {
			await updateSchedule({ ...schedule, status: 'confirmed' });
			reUpdateSchedules();
			setToastMessage({
				status: 'confirm',
				message: '일정을 확정하였습니다',
			});
		} catch (error) {
			setToastMessage({
				status: 'error',
				message: '일정 확정을 실패하였습니다',
			});
			console.error(error);
		}
	};

	const onCancelSchedule = async () => {
		setScheduleDeleteModalOpen(false);
		setScheduleDetailModalOpen(false);
		if (schedule?.id) {
			try {
				await cancelSchedule(schedule.id, 'admin');
				//이메일 전송 코드 추가
				reUpdateSchedules();
				setToastMessage({
					status: 'confirm',
					message: '일정을 취소하였습니다',
				});
			} catch (error) {
				console.error(error);
				setToastMessage({
					status: 'error',
					message: '일정 취소를 실패하였습니다',
				});
			}
		} else {
			setToastMessage({
				status: 'error',
				message: '스케줄 정보가 없습니다',
			});
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
			<div className='flex flex-col md:flex-row gap-4 p-6 min-h-[calc(100vh-151px)]'>
				{view === 'calendar' ? (
					<Calendar
						year={year}
						month={month}
						schedules={monthSchedules}
					/>
				) : (
					<ListView
						onConfirmSchedule={onConfirmSchedule}
						requestedSchedules={monthRequestedSchedules}
						confirmedSchedules={monthConfirmedSchedules}
						cancelledSchedules={monthCancelledSchedules}
					/>
				)}
				<div className='flex flex-col gap-4'>
					<Card>
						<div className='flex flex-col gap-6 min-w-[240px] min-h-[112px]'>
							<p className='text-Gray-900 heading-md'>
								다가오는 일정
							</p>
							{upcomingSchedules.length > 0 ? (
								upcomingSchedules.map((schedule) => (
									<ScheduleCard {...schedule} />
								))
							) : (
								<p className='text-Gray-400 body-md-regular text-center'>
									다가오는 일정이 없습니다.
									<br />
									3주 이내의 일정은 이곳에 표시됩니다.
								</p>
							)}
						</div>
					</Card>
					<Card>
						<div className='flex flex-col gap-6 min-w-[240px] min-h-[112px]'>
							<p className='text-Gray-900 heading-md'>
								요청온 일정
							</p>
							<div className='max-h-[400px] overflow-y-auto flex flex-col gap-6'>
								{requestedSchedules.length > 0 ? (
									requestedSchedules.map((schedule) => (
										<ScheduleCard {...schedule} />
									))
								) : (
									<p className='text-Gray-400 body-md-regular text-center'>
										요청온 일정이 없습니다.
										<br />
										일정 요청이 오면 이곳에 표시됩니다.
									</p>
								)}
							</div>
						</div>
					</Card>
					<Card>
						<div className='flex flex-col gap-6 min-w-[240px] min-h-[112px]'>
							<p className='text-Gray-900 heading-md'>
								잡아야하는 일정
							</p>
							{requiredSchedules.length > 0 ? (
								requiredSchedules.map((schedule) => (
									<ScheduleCardRequired {...schedule} />
								))
							) : (
								<p className='text-Gray-400 body-md-regular text-center'>
									잡아야하는 일정이 없습니다.
									<br />한 달 이내로 잡아야하는 일정은 이곳에
									표시됩니다.
								</p>
							)}
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
					title='일정 취소'
					firstBtnProps={{
						variant: 'danger',
						children: '일정 취소',
						onClick: onCancelSchedule,
					}}>
					<>해당 일정을 취소하시겠습니까?</>
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
