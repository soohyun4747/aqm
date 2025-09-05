import { Check } from './icons/Check';

interface CheckboxProps {
	checked?: boolean;
	label: string;
	subLabel?: string;
	disabled?: boolean;
	onClick?: () => void;
}

export function Checkbox(props: CheckboxProps) {
	return (
		<div
			onClick={props.onClick}
			className='flex gap-2 hover:cursor-pointer'>
			<CheckboxButton
				checked={props.checked}
				disabled={props.disabled}
			/>
			<div className='flex flex-col gap-1'>
				<p
					style={{ color: props.disabled ? '#9CA3AF' : '#111928' }}
					className='body-md-medium'>
					{props.label}
				</p>
				<p
					style={{ color: props.disabled ? '#9CA3AF' : '#6B7280' }}
					className='body-sm-regular'>
					{props.subLabel}
				</p>
			</div>
		</div>
	);
}

const CheckboxButton = ({
	checked,
	disabled,
}: {
	checked?: boolean;
	disabled?: boolean;
}) => {
	return (
		<div
			style={{
				borderWidth: !disabled && checked ? 0 : 0.5,
				background: !disabled && checked ? '#1A56DB' : '#F9FAFB',
			}}
			className='rounded-[4px] size-4 border-Gray-300 flex items-center justify-center'>
			{!disabled && checked && <Check fill='white' size={10} />}
		</div>
	);
};
