import { CardProps } from './Card';


export function Card2(props: CardProps) {
	return (
		<div
			style={{
				boxShadow:
					'0 1px 2px 0 rgba(0, 0, 0, 0.08)',
			}}
			className={`bg-white rounded-lg p-6 ${props.className}`}>
			{props.children}
		</div>
	);
}
