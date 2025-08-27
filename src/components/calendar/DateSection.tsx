import { formatToHHMM } from '@/utils/time';
import { ISchedule, serviceNames } from './Shedule';
import { useScreenTypeStore } from '@/stores/screenTypeStore';
import { areSameDate, isToday } from '@/utils/date';
import { useState } from 'react';
import { ScheduleDetailModal } from '../ScheduleDetailModal';
import { ScheduleEditModal } from '../ScheduleEditModal';

interface DateSectionProps {
	date: Date;
	value: number;
	schedules: ISchedule[];
	disabled?: boolean;
	selectedDate?: Date;
	onSelectDate?: (date: Date) => void;
	onSelectSchedule?: (schedule: ISchedule) => void;
}

export function DateSection(props: DateSectionProps) {
	const screenType = useScreenTypeStore((state) => state.screenType);

	return (
		<div
			onClick={() => {
				if (screenType === 'mobile' && props.onSelectDate) {
					props.onSelectDate(props.date);
				}
			}}
			style={{ background: props.disabled ? '#F9FAFB' : 'white' }}
			className='p-2 flex flex-col gap-4 h-[60px] md:h-[192px] flex-1 border-b border-r border-Gray-100'>
			<div
				style={{
					background: isToday(props.date)
						? '#FF5A1F'
						: props.selectedDate &&
						  areSameDate(props.date, props.selectedDate)
						? 'black'
						: 'transparent',
				}}
				className='px-1.5 rounded-full w-fit'>
				<p
					style={{
						color:
							isToday(props.date) ||
							(props.selectedDate &&
								areSameDate(props.date, props.selectedDate))
								? 'white'
								: props.disabled
								? '#6B7280'
								: '#111928',
					}}
					className='body-md-medium md:body-lg-medium w-fit'>
					{props.value}
				</p>
			</div>
			<div className='flex md:flex-col md:gap-2'>
				{props.schedules.map((schedule) => (
					<>
						{schedule.scheduleType === 'requested' ? (
							<RequestedSchedule {...schedule} />
						) : (
							<ConfirmedSchedule {...schedule} />
						)}
					</>
				))}
			</div>
		</div>
	);
}

export type ScheduleType = 'confirmed' | 'requested';

const RequestedSchedule = (schedule: ISchedule) => {
	const [openDetailModal, setOpenDetailModal] = useState(false);
	const [openEditModal, setOpenEditModal] = useState(false);
	const screenType = useScreenTypeStore((state) => state.screenType);

	return (
		<>
			<div
				onClick={() => {
					if (screenType === 'pc') {
						setOpenDetailModal(true);
					}
				}}
				className='md:px-2 md:py-1 flex items-center gap-2 rounded-[8px] md:bg-Orange-100 hover:cursor-pointer'>
				<OrangeDonut />
				<p className='hidden md:block body-md-medium text-Orange-800'>
					{formatToHHMM(schedule.date)}{' '}
					{serviceNames[schedule.serviceType]}
				</p>
			</div>
			{openDetailModal && (
				<ScheduleDetailModal
					schedule={schedule}
					onClose={() => setOpenDetailModal(false)}
					editModalOpen={() => setOpenEditModal(true)}
				/>
			)}
			{openEditModal && (
				<ScheduleEditModal
					schedule={schedule}
					onClose={() => setOpenEditModal(false)}
					onEdit={() => {}}
				/>
			)}
		</>
	);
};

const ConfirmedSchedule = (schedule: ISchedule) => {
	const [openDetailModal, setOpenDetailModal] = useState(false);
	const [openEditModal, setOpenEditModal] = useState(false);
	const screenType = useScreenTypeStore((state) => state.screenType);

	return (
		<>
			<div
				onClick={() => {
					if (screenType === 'pc') {
						setOpenDetailModal(true);
					}
				}}
				className='md:px-2 md:py-1 flex items-center gap-2 rounded-[8px] md:bg-Green-100 hover:cursor-pointer'>
				<GreenCircle />
				<p className='hidden md:block body-md-medium text-Green-800'>
					{formatToHHMM(schedule.date)}{' '}
					{serviceNames[schedule.serviceType]}
				</p>
			</div>
			{openDetailModal && (
				<ScheduleDetailModal
					schedule={schedule}
					onClose={() => setOpenDetailModal(false)}
					editModalOpen={() => setOpenEditModal(true)}
				/>
			)}
			{openEditModal && (
				<ScheduleEditModal
					schedule={schedule}
					onClose={() => setOpenEditModal(false)}
					onEdit={() => {}}
				/>
			)}
		</>
	);
};

const OrangeDonut = () => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			width='8'
			height='8'
			viewBox='0 0 8 8'
			fill='none'>
			<circle
				cx='4'
				cy='4'
				r='3.5'
				className='stroke-[#FF5A1F] md:stroke-[#8A2C0D]'
			/>
		</svg>
	);
};

const GreenCircle = () => {
	return (
		<div className='rounded-full size-[8px] bg-[#0E9F6E] md:bg-[#03543F]' />
	);
};
