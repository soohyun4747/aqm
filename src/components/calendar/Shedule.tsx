import { useState } from 'react';
import { Badge } from '../Badge';
import { Button } from '../buttons/Button';
import { Clock } from '../icons/Clock';
import { ScheduleType } from './DateSection';
import { ScheduleEditModal } from '../modals/ScheduleEditModal';
import { ServiceType } from '@/src/pages/admin/users/edit';

export interface ISchedule {
	date: Date;
	serviceType: ServiceType;
	scheduleType: ScheduleType;
	memo?: string;
	companyId: string;
}

export const serviceNames: { [key: string]: string } = {
	aqm: 'AQM 검사',
	hepa: 'HEPA 필터 교체',
	voc: 'VOC 필터 교체',
	as: '장비 설치/AS',
};

export const getServiceDropdownOptions = () => {
	const options = Object.keys(serviceNames).map((serviceId) => ({
		label: serviceNames[serviceId],
		value: serviceId,
	}));
	options.unshift({ label: '서비스 선택', value: '' });

	return options;
};

export function Schedule(props: ISchedule) {
	const [openEditModal, setOpenEditModal] = useState(false);
	const [openDetailModal, setOpenDetailModal] = useState(false);

	return (
		<>
			<div className='border border-Gray-200 bg-Gray-50 rounded-[8px] flex p-4 justify-between items-end self-stretch'>
				<div className='flex flex-col gap-3'>
					<div className='flex items-center gap-2 self-stretch'>
						{props.scheduleType === 'requested' ? (
							<RequestedBadge />
						) : (
							<ConfirmedBadge />
						)}
						<p>{serviceNames[props.serviceType]}</p>
					</div>
					<div className='flex items-center gap-1'>
						<Clock
							fill='#6B7280'
							size={12}
						/>
						<p className='body-md-regular text-Gray-500'>
							{props.date.toLocaleString()}
						</p>
					</div>
				</div>
				<Button
					onClick={() => setOpenEditModal(true)}
					variant='primaryOutline'>
					수정
				</Button>
			</div>
			{openEditModal && (
				<ScheduleEditModal
					schedule={props}
					onClose={() => setOpenEditModal(false)}
					onEdit={function (updatedSchedule: ISchedule): void {
						throw new Error('Function not implemented.');
					}}
				/>
			)}
		</>
	);
}

function ConfirmedBadge() {
	return (
		<Badge
			variant='green'
			label='확정됨'
		/>
	);
}

function RequestedBadge() {
	return (
		<Badge
			variant='orange'
			label='요청됨'
		/>
	);
}
