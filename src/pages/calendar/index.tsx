import { Calendar } from '@/src/components/calendar/Calendar';
import {
	ISchedule,
	ScheduleCard,
	serviceNames,
} from '@/src/components/calendar/ScheduleCard';
import { CalendarTopbar } from '@/src/components/CalendarTopbar';
import { Card } from '@/src/components/Card';
import { GNB } from '@/src/components/GNB';
import { today } from '@/src/utils/date';
import { useEffect, useMemo, useState } from 'react';
import {
	createSchedule as createScheduleApi,
	fetchConfirmedSchedulesWithin3WeeksByCompany,
	fetchLatestConfirmedSchedules,
	fetchRequestedSchedules,
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
import {
	buildRequiredItems,
	filterRequired,
	formatOverdueLabel,
} from '@/src/utils/schedule';
import { RequiredScheduleCard } from '@/src/components/calendar/RequiredScheduleCard';

function CompanyCalendarPage() {
	// month는 0~11로 통일합니다 (JS Date 규약)
	const [year, setYear] = useState(today.getFullYear());
	const [month, setMonth] = useState(today.getMonth());

	const [monthSchedules, setMonthSchedules] = useState<ISchedule[]>([]);
	const [requiredSchedules, setRequiredSchedules] = useState<ISchedule[]>([]);

	const [upcomingSchedules, setUpcomingSchedules] = useState<ISchedule[]>([]);
	const [requestedSchedules, setRequestedSchedules] = useState<ISchedule[]>(
		[]
	);
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
		if (user?.company) {
			getSetRequiredSchedules(user.company.id);
			getSetUpcomingSchedules(user.company.id);
			getSetRequestedSchedules(user.company.id);
		}
	}, [user]);

	useEffect(() => {
		if (user?.company) {
			getSetMonthSchedules(user.company.id);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [year, month, user]);

	const getSetUpcomingSchedules = async (companyId: string) => {
		try {
			const data = await fetchConfirmedSchedulesWithin3WeeksByCompany(
				companyId
			);
			setUpcomingSchedules(data.rows);
		} catch (error) {
			console.error(error);
		}
	};

	const getSetRequestedSchedules = async (companyId: string) => {
		try {
			const data = await fetchRequestedSchedules(companyId);
			setRequestedSchedules(data.rows);
		} catch (error) {
			console.error(error);
		}
	};

	const getSetRequiredSchedules = async (companyId: string) => {
		try {
			const latest = await fetchLatestConfirmedSchedules(companyId);
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
						it.isOverdue &&
						formatOverdueLabel(Math.abs(it.daysLeft)),
					//delayed: 연체된 경우 연체된 일수, 개월수 등 표시,
					scheduledAt: it.dueDate, // 기한을 날짜로 노출
					createdAt: now,
					updatedAt: now,
				}));

			setRequiredSchedules(mapped as ISchedule[]);
		} catch (e) {
			console.error('Error building required schedules:', e);
			setRequiredSchedules([]);
		}
	};

	const getSetMonthSchedules = async (companyId: string) => {
		// companyId가 있으면 해당 회사 스코프, 없으면(=관리자) 전체
		const data = await fetchSchedulesByMonth(year, month, {
			companyId: companyId,
		});

		setMonthSchedules(data.rows ?? []);
	};

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
				await getSetMonthSchedules(user.company.id);
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
			await updateSchedule({ ...schedule, status: 'requested' });
			if (user?.company) {
				getSetMonthSchedules(user.company.id);
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
								요청된 일정
							</p>
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
					</Card>
					<Card>
						<div className='flex flex-col gap-6 min-w-[240px] min-h-[112px]'>
							<p className='text-Gray-900 heading-md'>
								잡아야하는 일정
							</p>
							{requiredSchedules.length > 0 ? (
								requiredSchedules.map((schedule) => (
									<RequiredScheduleCard {...schedule} />
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
