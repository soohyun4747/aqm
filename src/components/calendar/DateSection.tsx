import { useScreenTypeStore } from '@/src/stores/screenTypeStore';
import { areSameDate, isToday } from '@/src/utils/date';
import { ConfirmedSchedule } from './ConfirmedSchedule';
import { RequestedSchedule } from './RequestedSchedule';
import { ISchedule } from '@/src/utils/supabase/schedule';
import { CancelledSchedule } from './CancelledSchedule';

interface DateSectionProps {
	date: Date;
	value: number;
	schedules: ISchedule[];
	disabled?: boolean;
	selectedDate?: Date;
	onSelectDate?: (date: Date) => void;
	onSelectSchedule?: (schedule: ISchedule) => void;
}

export function DateSection(props: DateSectionProps) {
	const screenType = useScreenTypeStore((state) => state.screenType);

	return (
		<div
			onClick={() => {
				if (screenType === 'mobile' && props.onSelectDate) {
					props.onSelectDate(props.date);
				}
			}}
			style={{ background: props.disabled ? '#F9FAFB' : 'white' }}
			className='p-2 flex flex-col gap-4 h-[60px] md:h-[192px] flex-1 border-b border-r border-Gray-100'>
			<div
				style={{
					background: isToday(props.date)
						? '#FF5A1F'
						: props.selectedDate &&
							  areSameDate(props.date, props.selectedDate)
							? 'black'
							: 'transparent',
				}}
				className='px-1.5 rounded-full w-fit'>
				<p
					style={{
						color:
							isToday(props.date) ||
							(props.selectedDate &&
								areSameDate(props.date, props.selectedDate))
								? 'white'
								: props.disabled
									? '#6B7280'
									: '#111928',
					}}
					className='body-md-medium md:body-lg-medium w-fit'>
					{props.value}
				</p>
			</div>
			<div className='flex md:flex-col md:gap-2 overflow-y-auto'>
				{props.schedules.map((schedule) => (
					<>
						{schedule.status === 'requested' ? (
							<RequestedSchedule schedule={schedule} />
						) : schedule.status === 'confirmed' ? (
							<ConfirmedSchedule schedule={schedule} />
						) : (
							<CancelledSchedule schedule={schedule}/>
						)}
					</>
				))}
			</div>
		</div>
	);
}
