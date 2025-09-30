import { useEffect, useState } from 'react';
import { Badge } from '../Badge';
import { Clock } from '../icons/Clock';
import { ScheduleStatusType } from './DateSection';
import { ServiceType } from '@/src/pages/admin/companies/edit';
import { toLocaleStringWithoutSec } from '@/src/utils/date';
import { Building } from '../icons/Building';
import { ICompany, useUserStore } from '@/src/stores/userStore';
import { fetchCompanyInfobyId } from '@/src/utils/supabase/company';
import { useSelectedScheduleStore } from '@/src/stores/selectedScheduleStore';
import { useScheduleDetailModalOpenStore } from '@/src/stores/modalOpenStore';

export interface ISchedule {
	id?: string;
	scheduledAt: Date;
	serviceType: ServiceType;
	status: ScheduleStatusType;
	memo?: string;
	companyId: string;
	companyName?: string;
	delayedLabel?: string;
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
	// const [company, setCompany] = useState<ICompany>();
	const setSelectedSchedule = useSelectedScheduleStore(
		(state) => state.setSchedule
	);
	const setScheduleDetailModalOpen = useScheduleDetailModalOpenStore(
		(state) => state.setOpen
	);

	// useEffect(() => {
	// 	if (props) {
	// 		getSetCompanyInfo(props);
	// 	}
	// }, [props]);

	// const getSetCompanyInfo = async (schedule: ISchedule) => {
	// 	const companyInfo = await fetchCompanyInfobyId(schedule.companyId);
	// 	setCompany(companyInfo);
	// };

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
