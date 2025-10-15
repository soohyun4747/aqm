import { useSelectedScheduleStore } from '@/src/stores/selectedScheduleStore';
import { Badge } from '../Badge';
import { Building } from '../icons/Building';
import { Clock } from '../icons/Clock';
import { toLocaleStringWithoutSec } from '@/src/utils/date';
import { useScheduleAddModalOpenStore } from '@/src/stores/modalOpenStore';
import { ISchedule } from '@/src/utils/supabase/schedule';
import { serviceNames } from '@/src/utils/supabase/companyServices';
import { useUserStore } from '@/src/stores/userStore';

export function ScheduleCardRequired(props: ISchedule) {
	const user = useUserStore((state) => state.user);

	const setSelectedSchedule = useSelectedScheduleStore(
		(state) => state.setSchedule
	);
	const setScheduleAddModalOpen = useScheduleAddModalOpenStore(
		(state) => state.setOpen
	);

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
					{user?.userType === 'admin' && (
						<div className='flex items-center gap-1'>
							<Building
								fill='#6B7280'
								size={12}
							/>
							<p className='body-md-regular text-Gray-500'>
								{props.companyName}
							</p>
						</div>
					)}
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
