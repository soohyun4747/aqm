import { formatToHHMM } from '@/utils/time';
import { serviceNames, ServiceType } from '../Notification';
import { isToday } from '@/utils/date';

interface DateSectionProps {
	value: number;
	isToday: boolean;
	schedules: UserSchedule[];
	disabled?: boolean;
}

export function DateSection(props: DateSectionProps) {
	return (
		<div
			style={{ background: props.disabled ? '#F9FAFB' : 'white' }}
			className='p-2 flex flex-col gap-4 h-[60px] md:h-[192px] flex-1 border-b border-r border-Gray-100'>
			<div
				style={{
					background: props.isToday ? '#FF5A1F' : 'transparent',
				}}
				className='px-1.5 rounded-full w-fit'>
				<p
					style={{
						color: props.isToday
							? 'white'
							: props.disabled
							? '#6B7280'
							: '#111928',
					}}
					className='body-md-medium md:body-lg-medium w-fit'>
					{props.value}
				</p>
			</div>
			<div className='flex md:flex-col md:gap-2'>
				{props.schedules.map((schedule) => (
					<>
						{schedule.scheduleType === 'requested' ? (
							<RequestedSchedule {...schedule} />
						) : (
							<ConfirmedSchedule {...schedule} />
						)}
					</>
				))}
			</div>
		</div>
	);
}

interface UserSchedule {
	date: Date;
	serviceType: ServiceType;
	scheduleType: ScheduleType;
}

export type ScheduleType = 'confirmed' | 'requested';

const RequestedSchedule = ({ date, serviceType }: UserSchedule) => {
	return (
		<div className='md:px-2 md:py-1 flex items-center gap-2 rounded-[8px] md:bg-Orange-100'>
			<OrangeDonut />
			<p className='hidden md:block body-md-medium text-Orange-800'>
				{formatToHHMM(date)} {serviceNames[serviceType]}
			</p>
		</div>
	);
};

const ConfirmedSchedule = ({ date, serviceType }: UserSchedule) => {
	return (
		<div className='md:px-2 md:py-1 flex items-center gap-2 rounded-[8px] md:bg-Green-100'>
			<GreenCircle />
			<p className='hidden md:block body-md-medium text-Green-800'>
				{formatToHHMM(date)} {serviceNames[serviceType]}
			</p>
		</div>
	);
};

const OrangeDonut = () => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			width='8'
			height='8'
			viewBox='0 0 8 8'
			fill='none'>
			<circle
				cx='4'
				cy='4'
				r='3.5'
				className='stroke-[#FF5A1F] md:stroke-[#8A2C0D]'
			/>
		</svg>
	);
};

const GreenCircle = () => {
	return (
		<div className='rounded-full size-[8px] bg-[#0E9F6E] md:bg-[#03543F]'/>
	);
};
