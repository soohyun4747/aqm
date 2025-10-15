import { useScreenTypeStore } from '@/src/stores/screenTypeStore';
import { OrangeDonut } from '../icons/OrangeDonut';
import { formatToHHMM } from '@/src/utils/time';
import { userTypes, useUserStore } from '@/src/stores/userStore';
import { useScheduleDetailModalOpenStore } from '@/src/stores/modalOpenStore';
import { useSelectedScheduleStore } from '@/src/stores/selectedScheduleStore';
import { ISchedule } from '@/src/utils/supabase/schedule';
import { serviceNames } from '@/src/utils/supabase/companyServices';

export const RequestedSchedule = ({ schedule }: { schedule: ISchedule }) => {
	const user = useUserStore((state) => state.user);

	return (
		<>
			{user?.userType === userTypes.admin ? (
				<RequestedScheduleAdmin schedule={schedule} />
			) : (
				<RequestedScheduleCompany schedule={schedule} />
			)}
		</>
	);
};

const RequestedScheduleCompany = ({ schedule }: { schedule: ISchedule }) => {
	const screenType = useScreenTypeStore((state) => state.screenType);
	const setSchedule = useSelectedScheduleStore((state) => state.setSchedule);
	const setScheduleDetailModalOpen = useScheduleDetailModalOpenStore(
		(state) => state.setOpen
	);

	return (
		<>
			<div
				onClick={() => {
					if (screenType === 'pc') {
						setSchedule(schedule);
						setScheduleDetailModalOpen(true);
					}
				}}
				className='md:px-2 md:py-1 flex items-center gap-2 rounded-[8px] md:bg-Orange-100 hover:cursor-pointer'>
				<OrangeDonut />
				<p className='hidden md:block body-md-medium text-Orange-800'>
					{formatToHHMM(schedule.scheduledAt)}{' '}
					{serviceNames[schedule.serviceType]}
				</p>
			</div>
		</>
	);
};

const RequestedScheduleAdmin = ({ schedule }: { schedule: ISchedule }) => {
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
				className='md:px-2 md:py-1 flex flex-col rounded-[8px] md:bg-Orange-100 hover:cursor-pointer'>
				<div className='flex items-center gap-2'>
					<OrangeDonut />
					<p className='hidden md:block body-md-medium text-Orange-800'>
						{formatToHHMM(schedule.scheduledAt)}{' '}
						{serviceNames[schedule.serviceType]}
					</p>
					<button className='hidden md:flex justify-center items-center px-[1px] py-2 rounded-[6px] bg-Orange-600 min-w-[30px]'>
						<p className='text-white text-[10px] font-[normal] font-[400] leading-[16px]'>
							확정
						</p>
					</button>
				</div>
				<div className='pl-4 hidden md:block'>
					<p className='text-Orange-500 truncate body-sm-medium'>
						{schedule.companyName}
					</p>
				</div>
			</div>
		</>
	);
};
