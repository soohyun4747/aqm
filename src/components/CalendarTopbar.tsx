import { ButtonGroup } from './ButtonGroup';
import { Button } from './buttons/Button';
import { ChevronLeft } from './icons/ChevronLeft';
import { ChevronRight } from './icons/ChevronRight';

export function CalendarTopbar() {
	return (
		<div className='w-full px-4 md:px-6 py-4 flex flex-col md:flex-row items-center md:justify-between gap-4 border-b border-Gray-200 bg-white'>
			<div className='flex items-center gap-[14px]'>
				<ChevronLeft
					size={14}
					fill='#6B7280'
				/>
				<p className='heading-md text-Gray-900 text-center'>
					2025년 7월
				</p>
				<ChevronRight
					size={14}
					fill='#6B7280'
				/>
			</div>
			<div className='flex flex-col md:flex-row items-center gap-4 w-full md:w-[unset]'>
				<ButtonGroup
					buttons={[
						{ label: 'Calendar View', id: 'calendar' },
						{ label: 'List View', id: 'list' },
					]}
                    className='w-full md:w-[unset]'
				/>
				<div className='flex items-center gap-2 w-full md:w-[unset]'>
					<Button variant='alternative' className='flex-1 md:flex-[unset]'>Today</Button>
					<Button className='flex-1 md:flex-[unset]'>Add new Calendar</Button>
				</div>
			</div>
		</div>
	);
}
