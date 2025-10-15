import { userTypes, useUserStore } from '@/src/stores/userStore';
import { useScreenTypeStore } from '@/src/stores/screenTypeStore';
import { formatToHHMM } from '@/src/utils/time';
import { GreenCircle } from '../icons/GreenCircle';
import { useScheduleDetailModalOpenStore } from '@/src/stores/modalOpenStore';
import { useSelectedScheduleStore } from '@/src/stores/selectedScheduleStore';
import { ISchedule } from '@/src/utils/supabase/schedule';
import { serviceNames } from '@/src/utils/supabase/companyServices';

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
				className='md:px-2 md:py-1 flex flex-col rounded-[8px] md:bg-Green-100 hover:cursor-pointer'>
				<div className='flex items-center gap-2'>
					<GreenCircle />
					<p className='hidden md:block body-md-medium text-Green-800'>
						{serviceNames[schedule.serviceType]}
					</p>
				</div>
				<div className='pl-4 hidden md:block'>
					<p className='text-Green-500 truncate body-sm-medium'>
						{schedule.companyName}
					</p>
				</div>
			</div>
		</>
	);
};
