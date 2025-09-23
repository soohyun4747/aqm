import { useEffect, useState } from 'react';
import { ISchedule, serviceNames } from './Schedule';
import { useScreenTypeStore } from '@/src/stores/screenTypeStore';
import { OrangeDonut } from '../icons/OrangeDonut';
import { formatToHHMM } from '@/src/utils/time';
import { ScheduleDetailModal } from '../modals/ScheduleDetailModal';
import { ScheduleEditModal } from '../modals/ScheduleEditModal';
import { ICompany, userTypes, useUserStore } from '@/src/stores/userStore';
import { fetchCompanyInfobyId } from '@/src/utils/supabase/company';

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
					{formatToHHMM(schedule.scheduledAt)}{' '}
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

const RequestedScheduleAdmin = ({ schedule }: { schedule: ISchedule }) => {
	const [openDetailModal, setOpenDetailModal] = useState(false);
	const [openEditModal, setOpenEditModal] = useState(false);
	const [company, setCompany] = useState<ICompany>();

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
						setOpenDetailModal(true);
					}
				}}
				className='md:px-2 md:py-1 flex flex-col rounded-[8px] md:bg-Orange-100 hover:cursor-pointer'>
				<div className='flex items-center gap-2'>
					<OrangeDonut />
					<p className='hidden md:block body-md-medium text-Orange-800'>
						{formatToHHMM(schedule.scheduledAt)}{' '}
						{serviceNames[schedule.serviceType]}
					</p>
					<button className='flex justify-center items-center px-[1px] py-2 rounded-[6px] bg-Orange-600'>
						<p className='text-white text-[10px] font-[normal] font-[400] leading-[16px]'>
							확정
						</p>
					</button>
				</div>
				<div className='pl-4'>
					<p className='text-Orange-500 truncate body-sm-medium'>
						{company?.name}
					</p>
				</div>
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
