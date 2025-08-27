import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from './icons/ChevronDown';

interface DropdownProps {
	label: string;
	options: Options[];
	value: string;
	id: string;
	onChange?: (value: string) => void;
}

interface Options {
	value: string;
	label?: string;
}

export function Dropdown(props: DropdownProps) {
	const [open, setOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// Add click listener to the document
		document.addEventListener('click', handleClickOutside);

		// Cleanup the listener on component unmount
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	}, []);

	const handleClickOutside = (e: MouseEvent) => {
		const target = e.target as HTMLElement | undefined;

		if (target && target.id === props.id) {
			setOpen(true);
		} else {
			setOpen(false); // Change state when clicking outside
		}
	};

	const handleSelect = (value: string) => {
		props.onChange?.(value);
		setOpen(false);
	};

	return (
		<div
			ref={dropdownRef}
			className='relative'>
			<div className='flex flex-col gap-2'>
				<p className='text-Gray-900 body-md-medium'>{props.label}</p>
				<div
					id={props.id}
					className='flex items-center h-[37px] p-2 justify-between self-stretch rounded-[8px] border border-Gray-300 bg-Gray-50 cursor-pointer'
					onClick={() => setOpen((prev) => !prev)}>
					<p
						id={props.id}
						className='text-Gray-300 body-md-regular'>
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
					className='absolute left-0 mt-2 z-10'>
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
	options: Options[];
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
