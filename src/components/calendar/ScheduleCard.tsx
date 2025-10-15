import { useState } from 'react';
import { Badge } from '../Badge';
import { Clock } from '../icons/Clock';
import { toLocaleStringWithoutSec } from '@/src/utils/date';
import { Building } from '../icons/Building';
import { ICompany, useUserStore } from '@/src/stores/userStore';
import { useSelectedScheduleStore } from '@/src/stores/selectedScheduleStore';
import { useScheduleDetailModalOpenStore } from '@/src/stores/modalOpenStore';
import { ISchedule } from '@/src/utils/supabase/schedule';
import { serviceNames } from '@/src/utils/supabase/companyServices';

export const getServiceDropdownOptions = () => {
	const options = Object.keys(serviceNames).map((serviceId) => ({
		label: serviceNames[serviceId],
		value: serviceId,
	}));
	options.unshift({ label: '서비스 선택', value: '' });

	return options;
};

export function ScheduleCard(props: ISchedule) {
	const user = useUserStore((state) => state.user);

	return (
		<>
			{user?.userType === 'admin' ? (
				<AdminSchedule {...props} />
			) : (
				<CompanySchedule {...props} />
			)}
		</>
	);
}

const AdminSchedule = (props: ISchedule) => {
	const setSelectedSchedule = useSelectedScheduleStore(
		(state) => state.setSchedule
	);
	const setScheduleDetailModalOpen = useScheduleDetailModalOpenStore(
		(state) => state.setOpen
	);

	return (
		<div
			onClick={() => {
				setScheduleDetailModalOpen(true);
				setSelectedSchedule(props);
			}}
			className='border border-Gray-200 bg-Gray-50 rounded-[8px] flex p-4 justify-between items-end self-stretch cursor-pointer'>
			<div className='flex flex-col gap-3'>
				<div className='flex items-center gap-2 self-stretch'>
					{props.status === 'requested' && <RequestedBadge />}
					{props.status === 'confirmed' && <ConfirmedBadge />}
					<p>{serviceNames[props.serviceType]}</p>
				</div>

				<div className='flex items-center gap-[12px]'>
					<div className='flex items-center gap-1'>
						<Building
							fill='#6B7280'
							size={12}
						/>
						<p className='body-md-regular text-Gray-500'>
							{props.companyName}
						</p>
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
			</div>
		</div>
	);
};

const CompanySchedule = (props: ISchedule) => {
	const [company, setCompany] = useState<ICompany>();
	const setSelectedSchedule = useSelectedScheduleStore(
		(state) => state.setSchedule
	);
	const setScheduleDetailModalOpen = useScheduleDetailModalOpenStore(
		(state) => state.setOpen
	);
	return (
		<div
			onClick={() => {
				setScheduleDetailModalOpen(true);
				setSelectedSchedule(props);
			}}
			className='border border-Gray-200 bg-Gray-50 rounded-[8px] flex p-4 justify-between items-end self-stretch cursor-pointer'>
			<div className='flex flex-col gap-3'>
				<div className='flex items-center gap-2 self-stretch'>
					{props.status === 'requested' && <RequestedBadge />}
					{props.status === 'confirmed' && <ConfirmedBadge />}
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
		</div>
	);
};

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
