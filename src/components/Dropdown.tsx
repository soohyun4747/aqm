import { useState, useRef, useEffect, CSSProperties } from 'react';
import { ChevronDown } from './icons/ChevronDown';

interface DropdownProps {
	label: string;
	options: Option[];
	value: string;
	id: string;
	isMandatory?: boolean;
	style?: CSSProperties;
	className?: string;
	onChange?: (value: string) => void;
}

export interface Option {
	value: string;
	label?: string;
}

export function Dropdown(props: DropdownProps) {
	const [open, setOpen] = useState(false);
	const [direction, setDirection] = useState<'up' | 'down'>('down'); // ✅ 방향 상태
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	}, []);

	const handleClickOutside = (e: MouseEvent) => {
		const target = e.target as HTMLElement | undefined;
		if (target && target.id === props.id) {
			// 열 때 방향 계산
			if (dropdownRef.current) {
				const rect = dropdownRef.current.getBoundingClientRect();
				const viewportHeight = window.innerHeight;
				const spaceBelow = viewportHeight - rect.bottom;
				const spaceAbove = rect.top;

				// 메뉴 높이 예상 (240px)
				if (spaceBelow < 240 && spaceAbove > spaceBelow) {
					setDirection('up');
				} else {
					setDirection('down');
				}
			}
			setOpen(true);
		} else {
			setOpen(false);
		}
	};

	const handleSelect = (value: string) => {
		props.onChange?.(value);
		setOpen(false);
	};

	return (
		<div
			ref={dropdownRef}
			style={props.style}
			className={`relative ${props.className}`}>
			<div className='flex flex-col gap-2'>
				<p className='text-Gray-900 body-md-medium'>
					{props.label}{' '}
					{props.isMandatory && (
						<span className='text-Red-600'>*</span>
					)}
				</p>
				<div
					id={props.id}
					className='flex items-center h-[37px] p-2 justify-between rounded-[8px] border border-Gray-300 bg-Gray-50 cursor-pointer'
					onClick={() => setOpen((prev) => !prev)}>
					<p
						id={props.id}
						className='text-Gray-500 body-md-regular'>
						{props.options.find((o) => o.value === props.value)
							?.label || '선택하세요'}
					</p>
					<ChevronDown
						size={10}
						id={props.id}
					/>
				</div>
			</div>

			{open && (
				<div
					style={{ width: '-webkit-fill-available' }}
					className={`absolute left-0 z-10 max-h-[240px] overflow-auto ${
						direction === 'down' ? 'mt-2 top-15' : 'mb-2 bottom-9'
					}`}>
					<DropdownMenu
						options={props.options}
						onChange={handleSelect}
					/>
				</div>
			)}
		</div>
	);
}

function DropdownMenu({
	options,
	onChange,
}: {
	options: Option[];
	onChange?: (value: string) => void;
}) {
	return (
		<div
			style={{
				boxShadow:
					'0 4px 6px -1px rgba(0, 0, 0, 0.10), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
			}}
			className='rounded-[8px] bg-white flex flex-col w-full'>
			{options.map((option) => (
				<div
					key={option.value}
					onClick={() => onChange?.(option.value)}
					className='flex self-stretch px-4 py-2 items-center group hover:bg-Gray-100 cursor-pointer'>
					<p className='text-Gray-700 body-md-regular group-hover:body-md-medium group-hover:text-Gray-900'>
						{option.label}
					</p>
				</div>
			))}
		</div>
	);
}
