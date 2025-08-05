import { CSSProperties, JSX } from 'react';
export interface IconProps {
	fill?: string;
	size?: number;
	id?: string;
}

interface IconButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	style?: CSSProperties;
	className?: string;
	icon: JSX.Element;
}

export function IconButton(props: IconButtonProps) {
	return (
		<button
			id={props.id}
			className='hover:cursor-pointer'
			{...props}>
			{props.icon}
		</button>
	);
}
