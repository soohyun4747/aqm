import { useState } from 'react';
import { Badge } from '../Badge';
import { Button } from '../buttons/Button';
import { Clock } from '../icons/Clock';
import { ScheduleStatusType } from './DateSection';
import { ScheduleEditModal } from '../modals/ScheduleEditModal';
import { ServiceType } from '@/src/pages/admin/companies/edit';
import { updateSchedule } from '@/src/utils/supabase/schedule';
import { IToastMessage, ToastMessage } from '../ToastMessage';
import { useScheduleEditModalOpenStore } from '@/src/stores/modalOpenStore';
import { useSelectedScheduleStore } from '@/src/stores/selectedScheduleStore';
import { toLocaleStringWithoutSec } from '@/src/utils/date';

export interface ISchedule {
	id?: string;
	scheduledAt: Date;
	serviceType: ServiceType;
	status: ScheduleStatusType;
	memo?: string;
	companyId: string;
	createdAt?: Date;
	updatedAt?: Date;
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
	const setScheduleEditModalOpen = useScheduleEditModalOpenStore(
		(state) => state.setOpen
	);
	const setSchedule = useSelectedScheduleStore((state) => state.setSchedule);

	return (
		<>
			<div className='border border-Gray-200 bg-Gray-50 rounded-[8px] flex p-4 justify-between items-end self-stretch'>
				<div className='flex flex-col gap-3'>
					<div className='flex items-center gap-2 self-stretch'>
						{props.status === 'requested' ? (
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
							{toLocaleStringWithoutSec(props.scheduledAt)}
						</p>
					</div>
				</div>
				{/* <Button
					onClick={() => {
						setScheduleEditModalOpen(true);
						setSchedule(props);
					}}
					variant='primaryOutline'>
					수정
				</Button> */}
			</div>
		</>
	);
}

export function ConfirmedBadge() {
	return (
		<Badge
			variant='green'
			label='확정'
		/>
	);
}

export function RequestedBadge() {
	return (
		<Badge
			variant='orange'
			label='요청'
		/>
	);
}
