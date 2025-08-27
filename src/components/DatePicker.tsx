import { useRef } from 'react';
import { Calendar } from './icons/Calendar';
import { formatDate } from '@/utils/date';

interface DatePickerProps {
	date: Date;
	onChange: (date: Date) => void;
}

export function DatePicker(props: DatePickerProps) {
	const inputRef = useRef<HTMLInputElement>(null);

	const handleChangeDate = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		const [year, month, day] = value.split('-').map(Number);
		const prevDate = props.date;
		const newDate = new Date(prevDate);
		newDate.setFullYear(year, month - 1, day);
		// 시간, 분, 초는 기존 값 유지
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
			<p className='text-Gray-900 body-md-medium'>날짜</p>
			<div
				onClick={handleClick}
				className='flex items-center gap-[10px] border border-Gray-300 rounded-[8px] bg-Gray-50 px-4 py-3 relative'>
				<Calendar fill='#6B7280' />
				<p className='text-Gray-500 body-md-regular'>
					{formatDate(props.date)}
				</p>
				<input
					ref={inputRef}
					type='date'
					value={`${props.date.getFullYear()}-${(
						props.date.getMonth() + 1
					)
						.toString()
						.padStart(2, '0')}-${props.date
						.getDate()
						.toString()
						.padStart(2, '0')}`}
					onChange={handleChangeDate}
					className='absolute opacity-0 w-full h-full cursor-pointer'
					style={{ left: 0, top: 0 }}
					tabIndex={-1}
				/>
			</div>
		</div>
	);
}
