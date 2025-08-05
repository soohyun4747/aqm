import { CSSProperties, JSX } from 'react';

interface PopoverProps {
	title: string;
	content: JSX.Element;
	className?: string;
	style?: CSSProperties;
}

export function Popover(props: PopoverProps) {
	return (
		<div
			style={props.style}
			className={`border border-Gray-200 rounded-[8px] p-4 flex flex-col gap-2.5 bg-white ${props.className}`}>
			<p className='heading-sm'>{props.title}</p>
			{props.content}
		</div>
	);
}
