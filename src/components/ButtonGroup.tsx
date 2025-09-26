import { CSSProperties } from 'react';

interface ButtonGroupProps {
	buttons: { id: string; label: string; onClick?: () => void }[];
	selectedId?: string;
	className?: string;
	style?: CSSProperties;
}

export function ButtonGroup(props: ButtonGroupProps) {
	return (
		<div
			style={props.style}
			className={`hover:cursor-pointer flex items-center -space-x-[1px] ${props.className}`}>
			{props.buttons.map((btn, i) => (
				<div
					onClick={btn.onClick}
					className={`flex-1 md:flex-[unset] flex justify-center border border-Gray-200 ${
						i === 0
							? 'rounded-tl-[6px] rounded-bl-[6px]'
							: i === props.buttons.length - 1
							? 'rounded-tr-[6px] rounded-br-[6px]'
							: ''
					} px-4 py-2 ${
						btn.id === props.selectedId ? 'bg-Gray-50' : 'bg-white'
					}`}>
					<p
						className={`body-md-medium ${
							btn.id === props.selectedId
								? 'text-Primary-700'
								: 'text-Gray-900'
						}`}>
						{btn.label}
					</p>
				</div>
			))}
		</div>
	);
}
