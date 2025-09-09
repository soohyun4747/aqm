import { JSX } from 'react';

export interface CardProps {
	children: JSX.Element;
	className?: string;
}

export function Card(props: CardProps) {
	return (
		<div
			style={{
				boxShadow:
					'0 1px 3px 0 rgba(0, 0, 0, 0.10), 0 1px 2px -1px rgba(0, 0, 0, 0.10)',
			}}
			className={`bg-white rounded-lg p-6 ${props.className}`}>
			{props.children}
		</div>
	);
}
