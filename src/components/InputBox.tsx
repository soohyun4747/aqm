import { CSSProperties, JSX } from 'react';
import { IconButton } from './IconButton';
import { Close } from './icons/Close';

interface InputBoxProps {
	inputAttr?: React.InputHTMLAttributes<HTMLInputElement>;
	label?: string;
	desc?: string;
	icon?: JSX.Element;
	style?: CSSProperties;
	className?: string;
	onDelete?: () => void;
}

export function InputBox(props: InputBoxProps) {
	return (
		<div
			style={props.style}
			className={`flex flex-col gap-2 ${props.className}`}>
			<p className='body-md-medium text-Gray-900'>{props.label}</p>
			<div className='flex items-center justify-between px-4 py-2 border border-Gray-300 rounded-[8px] bg-Gray-50'>
				<div className='flex items-center gap-2.5 w-full'>
					{props.icon}
					<input
						{...props.inputAttr}
						className='outline-0 body-md-regular w-full'
					/>
				</div>
				{props.onDelete && (
					<IconButton
						icon={
							<Close
								size={10}
								fill='#6B7280'
							/>
						}
						onClick={props.onDelete}
					/>
				)}
			</div>
			{props.desc && (
				<p className='body-md-regular text-Gray-500'>{props.desc}</p>
			)}
		</div>
	);
}
