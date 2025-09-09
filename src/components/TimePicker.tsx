import { useRef } from 'react';
import { Clock } from './icons/Clock';
import { formatTime } from '@/src/utils/date';

interface TimePickerProps {
	date: Date;
	onChange: (date: Date) => void;
}

export function TimePicker(props: TimePickerProps) {
	const inputRef = useRef<HTMLInputElement>(null);

	const handleChangeTime = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		const [hours, minutes] = value.split(':').map(Number);
		const prevDate = props.date;
		const newDate = new Date(prevDate);
		newDate.setHours(hours, minutes);
		// 연, 월, 일은 기존 값 유지
		props.onChange(newDate);
	};

	const handleClick = () => {
		if (inputRef.current) {
			inputRef.current.showPicker?.(); // 크롬/엣지 등 최신 브라우저 지원
			inputRef.current.focus(); // showPicker 없는 경우 대체
		}
	};

	return (
		<div className='flex flex-col gap-2 flex-1 self-stretch'>
			<p className='text-Gray-900 body-md-medium'>시간</p>
			<div
				onClick={handleClick}
				className='flex items-center gap-[10px] border border-Gray-300 rounded-[8px] bg-Gray-50 px-4 py-3 relative'>
				<Clock fill='#6B7280' />
				<p className='text-Gray-500 body-md-regular'>
					{formatTime(props.date)}
				</p>
				<input
					ref={inputRef}
					type='time'
					value={`${props.date
						.getHours()
						.toString()
						.padStart(2, '0')}:${props.date
						.getMinutes()
						.toString()
						.padStart(2, '0')}`}
					onChange={handleChangeTime}
					className='absolute opacity-0 w-full h-full cursor-pointer'
					style={{ left: 0, top: 0 }}
					tabIndex={-1}
				/>
			</div>
		</div>
	);
}
