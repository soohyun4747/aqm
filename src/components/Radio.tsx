interface RadioProps {
	selected?: boolean;
	label: string;
	subLabel?: string;
	disabled?: boolean;
	onClick?: () => void;
}

export function Radio(props: RadioProps) {
	return (
		<div
			onClick={props.onClick}
			className='flex gap-2 hover:cursor-pointer'>
			<RadioButton
				selected={props.selected}
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
					{props.label}
				</p>
			</div>
		</div>
	);
}

const RadioButton = ({
	selected,
	disabled,
}: {
	selected?: boolean;
	disabled?: boolean;
}) => {
	return (
		<div
			style={{
				borderColor: !disabled && selected ? '#1A56DB' : '#D1D5DB',
				borderWidth: !disabled && selected ? 3.5 : 0.5,
			}}
			className='rounded-full size-4 bg-Gray-50'></div>
	);
};
