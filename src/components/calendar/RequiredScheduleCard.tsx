import { ICompany } from '@/src/stores/userStore';
import { ISchedule, serviceNames } from './ScheduleCard';
import { useEffect, useState } from 'react';
import { useSelectedScheduleStore } from '@/src/stores/selectedScheduleStore';
import { fetchCompanyInfobyId } from '@/src/utils/supabase/company';
import { Badge } from '../Badge';
import { Building } from '../icons/Building';
import { Clock } from '../icons/Clock';
import { toLocaleStringWithoutSec } from '@/src/utils/date';
import { useScheduleAddModalOpenStore } from '@/src/stores/modalOpenStore';

export function RequiredScheduleCard(props: ISchedule) {
	// const [company, setCompany] = useState<ICompany>();
	const setSelectedSchedule = useSelectedScheduleStore(
		(state) => state.setSchedule
	);
	const setScheduleAddModalOpen = useScheduleAddModalOpenStore(
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
				setScheduleAddModalOpen(true);
				setSelectedSchedule(props);
			}}
			className='border border-Gray-200 bg-Gray-50 rounded-[8px] flex p-4 justify-between items-end self-stretch cursor-pointer'>
			<div className='flex flex-col gap-3'>
				<div className='flex items-center gap-2 self-stretch'>
					<p>{serviceNames[props.serviceType]}</p>
					{props.delayedLabel && (
						<RequiredBadge label={props.delayedLabel} />
					)}
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
}

function RequiredBadge({ label }: { label: string }) {
	return (
		<Badge
			variant='pink'
			label={label}
		/>
	);
}
