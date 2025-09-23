import { CSSProperties, JSX } from 'react';

interface TextAreaProps {
	textareaAttr?: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
	label?: string;
	desc?: string;
	style?: CSSProperties;
	className?: string;
	isMandatory?: boolean;
}

export function TextAreaBox(props: TextAreaProps) {
	return (
		<div
			style={props.style}
			className={`flex flex-col gap-2 ${props.className}`}>
			<p className='body-md-medium text-Gray-900'>
				{props.label}{' '}
				{props.isMandatory && <span className='text-Red-600'>*</span>}
			</p>
			<div className='flex items-center justify-between px-4 py-2 border border-Gray-300 rounded-[8px] bg-Gray-50'>
				<textarea
					{...props.textareaAttr}
					className='outline-0 body-md-regular w-full resize-none'
				/>
			</div>
			{props.desc && (
				<p className='body-md-regular text-Gray-500'>{props.desc}</p>
			)}
		</div>
	);
}
