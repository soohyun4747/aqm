import { useEffect, useState } from 'react';
import { Button } from './buttons/Button';
import { ISchedule, serviceNames } from './calendar/ScheduleCard';
import { Building } from './icons/Building';
import { ICompany } from '../stores/userStore';
import { fetchCompanyInfobyId } from '../utils/supabase/company';
import { Clock } from './icons/Clock';
import { Card } from './Card';
import { toDate, toDayLabel, toLocaleStringWithoutSec } from '../utils/date';
import { useScheduleDetailModalOpenStore } from '../stores/modalOpenStore';
import { useSelectedScheduleStore } from '../stores/selectedScheduleStore';
import { updateSchedule } from '../utils/supabase/schedule';

interface DayGroupSchedules {
	day: string; // ex. 6일, 31일, 20일
	schedules: ISchedule[];
}

/** 같은 달 내의 스케줄들을 '일자' 단위로 그룹화 */
function groupSchedulesByDay(schedules: ISchedule[]): DayGroupSchedules[] {
	const map = new Map<string, ISchedule[]>();

	for (const s of schedules) {
		const d = toDate(s.scheduledAt);
		const key = toDayLabel(d);
		if (!map.has(key)) map.set(key, []);
		map.get(key)!.push(s);
	}

	// 일자 숫자 기준 오름차순 정렬
	const sortedKeys = [...map.keys()].sort((a, b) => {
		const na = parseInt(a.replace('일', ''), 10);
		const nb = parseInt(b.replace('일', ''), 10);
		return na - nb;
	});

	return sortedKeys.map((k) => ({
		day: k,
		schedules: map
			.get(k)!
			.sort((a, b) => +toDate(a.scheduledAt) - +toDate(b.scheduledAt)),
	}));
}

export function ListView({
	requestedSchedules,
	confirmedSchedules,
	onConfirmSchedule,
}: {
	requestedSchedules: ISchedule[];
	confirmedSchedules: ISchedule[];
	onConfirmSchedule: (schedule: ISchedule) => Promise<void>;
}) {
	const [dayConfirmedSchedules, setDayConfirmedSchedules] = useState<
		DayGroupSchedules[]
	>([]);
	const [dayRequestedSchedules, setDayRequestedSchedules] = useState<
		DayGroupSchedules[]
	>([]);

	// props 변경 시 그룹 재계산
	useEffect(() => {
		setDayRequestedSchedules(groupSchedulesByDay(requestedSchedules ?? []));
	}, [requestedSchedules]);

	useEffect(() => {
		setDayConfirmedSchedules(groupSchedulesByDay(confirmedSchedules ?? []));
	}, [confirmedSchedules]);

	return (
		<div className='flex flex-col gap-4 flex-1'>
			<Card className='flex-1'>
				<div className='flex flex-col gap-6 h-full'>
					<p className='heading-md text-Gray-900'>요청온 일정</p>
					{dayRequestedSchedules.length > 0 ? (
						dayRequestedSchedules.map((dayGroup) => (
							<div className='flex flex-col gap-3'>
								<p className='text-Gray-900 body-lg-md'>
									{dayGroup.day}
								</p>
								{dayGroup.schedules.map((schedule) => (
									<ListViewRequestedItem
										schedule={schedule}
										onConfirmSchedule={onConfirmSchedule}
									/>
								))}
							</div>
						))
					) : (
						<div className='flex items-center justify-center w-full h-[70%]'>
							<p className='text-Gray-400 body-md-regular text-center'>
								요청온 일정이 없습니다.
								<br />
								요청이 들어오면 이곳에 표시됩니다.
							</p>
						</div>
					)}
				</div>
			</Card>
			<Card className='flex-1'>
				<div className='flex flex-col gap-6 h-full'>
					<p className='heading-md text-Gray-900'>확정된 일정</p>
					{dayConfirmedSchedules.length > 0 ? (
						dayConfirmedSchedules.map((dayGroup) => (
							<div className='flex flex-col gap-3'>
								<p className='text-Gray-900 body-lg-md'>
									{dayGroup.day}
								</p>
								{dayGroup.schedules.map((schedule) => (
									<ListViewConfirmedItem
										schedule={schedule}
									/>
								))}
							</div>
						))
					) : (
						<div className='flex items-center justify-center w-full h-[70%]'>
							<p className='text-Gray-400 body-md-regular text-center'>
								확정된 일정이 없습니다.
								<br />
								일정이 확정되면 이곳에 표시됩니다.
							</p>
						</div>
					)}
				</div>
			</Card>
		</div>
	);
}

function ListViewConfirmedItem({ schedule }: { schedule: ISchedule }) {
	// const [company, setCompany] = useState<ICompany>();
	const setScheduleDetailModalOpen = useScheduleDetailModalOpenStore(
		(state) => state.setOpen
	);
	const setSelectedSchedule = useSelectedScheduleStore(
		(state) => state.setSchedule
	);

	// useEffect(() => {
	// 	if (schedule) {
	// 		getSetCompanyInfo(schedule);
	// 	}
	// }, [schedule]);

	// const getSetCompanyInfo = async (schedule: ISchedule) => {
	// 	const companyInfo = await fetchCompanyInfobyId(schedule.companyId);
	// 	setCompany(companyInfo);
	// };

	return (
		<div className={`px-4 py-2 flex bg-Green-50 items-center`}>
			<div className='flex flex-col gap-[6px] flex-1'>
				<p className='text-body-lg text-Gray-900'>
					{serviceNames[schedule.serviceType]}
				</p>
				<div className='flex items-center gap-3'>
					<div className='flex items-center gap-1'>
						<Building
							size={12}
							fill='#6B7280'
						/>
						<p className='text-Gray-500 body-md-regular'>
							{schedule.companyName}
						</p>
					</div>
					<div className='flex items-center gap-1'>
						<Clock
							size={12}
							fill='#6B7280'
						/>
						<p className='text-Gray-500 body-md-regular'>
							{toLocaleStringWithoutSec(schedule.scheduledAt)}
						</p>
					</div>
				</div>
			</div>
			<Button
				variant='alternative'
				onClick={() => {
					setScheduleDetailModalOpen(true);
					setSelectedSchedule(schedule);
				}}>
				보기
			</Button>
		</div>
	);
}

function ListViewRequestedItem({
	schedule,
	onConfirmSchedule,
}: {
	schedule: ISchedule;
	onConfirmSchedule: (schedule: ISchedule) => Promise<void>;
}) {
	// const [company, setCompany] = useState<ICompany>();
	const setScheduleDetailModalOpen = useScheduleDetailModalOpenStore(
		(state) => state.setOpen
	);
	const setSelectedSchedule = useSelectedScheduleStore(
		(state) => state.setSchedule
	);

	// useEffect(() => {
	// 	if (schedule) {
	// 		getSetCompanyInfo(schedule);
	// 	}
	// }, [schedule]);

	// const getSetCompanyInfo = async (schedule: ISchedule) => {
	// 	const companyInfo = await fetchCompanyInfobyId(schedule.companyId);
	// 	setCompany(companyInfo);
	// };

	return (
		<div className={`px-4 py-2 flex bg-Orange-50`}>
			<div className='flex flex-col gap-[6px] flex-1'>
				<p className='text-body-lg text-Gray-900'>
					{serviceNames[schedule.serviceType]}
				</p>
				<div className='flex items-center gap-3'>
					<div className='flex items-center gap-1'>
						<Building
							size={12}
							fill='#6B7280'
						/>
						<p className='text-Gray-500 body-md-regular'>
							{schedule.companyName}
						</p>
					</div>
					<div className='flex items-center gap-1'>
						<Clock
							size={12}
							fill='#6B7280'
						/>
						<p className='text-Gray-500 body-md-regular'>
							{toLocaleStringWithoutSec(schedule.scheduledAt)}
						</p>
					</div>
				</div>
			</div>
			<div className='flex gap-[10px] items-center'>
				<Button
					variant='alternative'
					onClick={() => {
						setScheduleDetailModalOpen(true);
						setSelectedSchedule(schedule);
					}}>
					보기
				</Button>
				<Button
					variant='danger'
					onClick={() => onConfirmSchedule(schedule)}>
					확정
				</Button>
			</div>
		</div>
	);
}
