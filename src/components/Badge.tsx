interface BadgeProps {
	variant: 'green' | 'orange';
	label: string;
}

export function Badge(props: BadgeProps) {
	return (
		<div
			style={{
				background: props.variant === 'green' ? '#DEF7EC' : '#FEECDC',
			}}
			className='max-w-[370px] py-[2px] px-[10px] gap-1 flex rounded-[6px]'>
			<p
				style={{
					color:
						props.variant === 'green' ? '#03543F' : '#8A2C0D',
				}}
				className='text-ceter truncate body-sm-medium'>
				{props.label}
			</p>
		</div>
	);
}
