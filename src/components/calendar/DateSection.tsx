import { formatToHHMM } from '@/utils/time';
import { serviceNames, ServiceType } from '../Notification';

interface DateSectionProps {
	value: number;
	schedules: UserSchedule[];
}

export function DateSection(props: DateSectionProps) {
	return (
		<div className='p-2 flex flex-col gap-4'>
			<p
				style={{ color: '#111928' }}
				className='body-lg-medium'>
				{props.value}
			</p>
			<div className='flex flex-col gap-2'>
				{props.schedules.map((schedule) => (
					<DateSchedule {...schedule} />
				))}
			</div>
		</div>
	);
}

interface UserSchedule {
	date: Date;
	serviceType: ServiceType;
}

const DateSchedule = ({ date, serviceType }: UserSchedule) => {
	return (
		<div className='px-2 py-1 flex items-center gap-2 rounded-[8px]'>
			<OrangeDonut />
			<p className='body-md-medium text-Orange-800 overflow-hidden text-ellipsis'>
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
				stroke='#8A2C0D'
			/>
		</svg>
	);
};
