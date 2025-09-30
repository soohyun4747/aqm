interface BadgeProps {
	variant: 'green' | 'orange' | 'pink';
	label: string;
}

const variants = {
	green: { background: '#DEF7EC', color: '#03543F' },
	orange: { background: '#FEECDC', color: '#8A2C0D' },
	pink: { background: '#FCE8F3', color: '#99154B' },
};

export function Badge(props: BadgeProps) {
	return (
		<div
			style={{
				background: variants[props.variant].background,
			}}
			className='max-w-[370px] py-[2px] px-[10px] gap-1 flex rounded-[6px] h-fit'>
			<p
				style={{
					color: variants[props.variant].color,
				}}
				className='text-ceter truncate body-sm-medium'>
				{props.label}
			</p>
		</div>
	);
}
