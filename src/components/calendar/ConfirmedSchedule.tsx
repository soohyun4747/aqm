import { ICompany, userTypes, useUserStore } from '@/src/stores/userStore';
import { ISchedule, serviceNames } from './Schedule';
import { useEffect, useState } from 'react';
import { useScreenTypeStore } from '@/src/stores/screenTypeStore';
import { ScheduleDetailModal } from '../modals/ScheduleDetailModal';
import { ScheduleEditModal } from '../modals/ScheduleEditModal';
import { formatToHHMM } from '@/src/utils/time';
import { fetchCompanyInfobyId } from '@/src/utils/supabase/company';
import { GreenCircle } from '../icons/GreenCircle';
import { updateSchedule } from '@/src/utils/supabase/schedule';
import { IToastMessage, ToastMessage } from '../ToastMessage';
import { useScheduleDetailModalOpenStore } from '@/src/stores/modalOpenStore';
import { useSelectedScheduleStore } from '@/src/stores/selectedScheduleStore';

export const ConfirmedSchedule = ({ schedule }: { schedule: ISchedule }) => {
	const user = useUserStore((state) => state.user);

	return (
		<>
			{user?.userType === userTypes.admin ? (
				<ConfirmedScheduleAdmin schedule={schedule} />
			) : (
				<ConfirmedScheduleCompany schedule={schedule} />
			)}
		</>
	);
};

const ConfirmedScheduleCompany = ({ schedule }: { schedule: ISchedule }) => {
	const setScheduleDetailModalOpen = useScheduleDetailModalOpenStore(
		(state) => state.setOpen
	);
	const setSchedule = useSelectedScheduleStore((state) => state.setSchedule);
	const screenType = useScreenTypeStore((state) => state.screenType);

	return (
		<>
			<div
				onClick={() => {
					if (screenType === 'pc') {
						setSchedule(schedule);
						setScheduleDetailModalOpen(true);
					}
				}}
				className='md:px-2 md:py-1 flex items-center gap-2 rounded-[8px] md:bg-Green-100 hover:cursor-pointer'>
				<GreenCircle />
				<p className='hidden md:block body-md-medium text-Green-800'>
					{formatToHHMM(schedule.scheduledAt)}{' '}
					{serviceNames[schedule.serviceType]}
				</p>
			</div>
		</>
	);
};

const ConfirmedScheduleAdmin = ({ schedule }: { schedule: ISchedule }) => {
	const [company, setCompany] = useState<ICompany>();
	const setScheduleDetailModalOpen = useScheduleDetailModalOpenStore(
		(state) => state.setOpen
	);
	const setSchedule = useSelectedScheduleStore((state) => state.setSchedule);

	const screenType = useScreenTypeStore((state) => state.screenType);

	useEffect(() => {
		getSetCompanyInfo(schedule);
	}, [schedule]);

	const getSetCompanyInfo = async (schedule: ISchedule) => {
		const companyInfo = await fetchCompanyInfobyId(schedule.companyId);
		setCompany(companyInfo);
	};

	return (
		<>
			<div
				onClick={() => {
					if (screenType === 'pc') {
						setSchedule(schedule);
						setScheduleDetailModalOpen(true);
					}
				}}
				className='md:px-2 md:py-1 flex flex-col rounded-[8px] md:bg-Green-100 hover:cursor-pointer'>
				<div className='flex items-center gap-2'>
					<GreenCircle />
					<p className='hidden md:block body-md-medium text-Green-800'>
						{serviceNames[schedule.serviceType]}
					</p>
				</div>
				<div className='pl-4'>
					<p className='text-Green-500 truncate body-sm-medium'>
						{company?.name}
					</p>
				</div>
			</div>
		</>
	);
};
