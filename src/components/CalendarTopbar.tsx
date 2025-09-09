import { ButtonGroup } from './ButtonGroup';
import { Button } from './buttons/Button';
import { CalendarProps } from './calendar/Calendar';
import { IconButton } from './IconButton';
import { ChevronLeft } from './icons/ChevronLeft';
import { ChevronRight } from './icons/ChevronRight';

interface CalndarTopBarProps {
	year: number;
	month: number;
	onClickCalendarView: () => void;
	onClickListView: () => void;
	onClickToday: () => void;
	onClickAddNewSchedule: () => void;
	onClickPrevMonth: () => void;
	onClickNextMonth: () => void;
}

export function CalendarTopbar(props: CalndarTopBarProps) {
	return (
		<div className='w-full px-4 md:px-6 py-4 flex flex-col md:flex-row items-center md:justify-between gap-4 border-b border-Gray-200 bg-white'>
			<div className='flex items-center gap-[14px]'>
				<IconButton
					icon={
						<ChevronLeft
							size={14}
							fill='#6B7280'
						/>
					}
					onClick={props.onClickPrevMonth}
				/>
				<p className='heading-md text-Gray-900 text-center'>
					{props.year}년 {props.month}월
				</p>
				<IconButton
					icon={
						<ChevronRight
							size={14}
							fill='#6B7280'
						/>
					}
					onClick={props.onClickNextMonth}
				/>
			</div>
			<div className='flex flex-col md:flex-row items-center gap-4 w-full md:w-[unset]'>
				<ButtonGroup
					buttons={[
						{
							label: 'Calendar View',
							id: 'calendar',
							onClick: props.onClickCalendarView,
						},
						{
							label: 'List View',
							id: 'list',
							onClick: props.onClickListView,
						},
					]}
					className='w-full md:w-[unset]'
				/>
				<div className='flex items-center gap-4 w-full md:w-[unset]'>
					<Button
						variant='alternative'
						className='flex-1 md:flex-[unset]'
						onClick={props.onClickToday}>
						Today
					</Button>
					<Button
						className='flex-1 md:flex-[unset]'
						onClick={props.onClickAddNewSchedule}>
						Add new schedule
					</Button>
				</div>
			</div>
		</div>
	);
}
