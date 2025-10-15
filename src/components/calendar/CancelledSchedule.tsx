import { userTypes, useUserStore } from '@/src/stores/userStore';
import { useScreenTypeStore } from '@/src/stores/screenTypeStore';
import { formatToHHMM } from '@/src/utils/time';
import { useScheduleDetailModalOpenStore } from '@/src/stores/modalOpenStore';
import { useSelectedScheduleStore } from '@/src/stores/selectedScheduleStore';
import { ISchedule } from '@/src/utils/supabase/schedule';
import { serviceNames } from '@/src/utils/supabase/companyServices';
import { GrayCircle } from '../icons/GrayCircle';

export const CancelledSchedule = ({ schedule }: { schedule: ISchedule }) => {
	const user = useUserStore((state) => state.user);

	return (
		<>
			{user?.userType === userTypes.admin ? (
				<></>
			) : (
				<CancelledScheduleCompany schedule={schedule} />
			)}
		</>
	);
};

const CancelledScheduleCompany = ({ schedule }: { schedule: ISchedule }) => {

	return (
		<>
			<div
				className='md:px-2 md:py-1 flex items-center gap-2 rounded-[8px] md:bg-Gray-100 hover:cursor-pointer'>
				<GrayCircle />
				<p className='hidden md:block body-md-medium text-Gray-400'>
					{formatToHHMM(schedule.scheduledAt)}{' '}
					{serviceNames[schedule.serviceType]}
				</p>
			</div>
		</>
	);
};

// const CancelledScheduleAdmin = ({ schedule }: { schedule: ISchedule }) => {

// 	return (
// 		<>
// 			<div
// 				className='md:px-2 md:py-1 flex flex-col rounded-[8px] md:bg-Gray-100 hover:cursor-pointer'>
// 				<div className='flex items-center gap-2'>
// 					<GrayCircle />
// 					<p className='hidden md:block body-md-medium text-Gray-400'>
// 						{serviceNames[schedule.serviceType]}
// 					</p>
// 				</div>
// 				<div className='pl-4'>
// 					<p className='text-Gray-400 truncate body-sm-medium'>
// 						{schedule.companyName}
// 					</p>
// 				</div>
// 			</div>
// 		</>
// 	);
// };
