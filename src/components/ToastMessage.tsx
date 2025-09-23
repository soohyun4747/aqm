import { Dispatch, SetStateAction, useEffect } from 'react';
import { CircleCheck } from './icons/CircleCheck';
import { CircleExclamation } from './icons/CircleExclamation';
import { CircleX } from './icons/CircleX';

export type ToastMessageStatusType = 'error' | 'confirm' | 'warning';

export interface IToastMessage {
	status: ToastMessageStatusType;
	message: string;
}

export interface ToastMessageProps extends IToastMessage {
	setToastMessage: Dispatch<
		SetStateAction<
			| IToastMessage
			| undefined
		>
	>;
}

const ToastMessageIcon = ({ status }: { status: ToastMessageStatusType }) => {
	switch (status) {
		case 'error':
			return <CircleX fill='#E02424' />;
		case 'confirm':
			return <CircleCheck fill='#1C64F2' />;
		case 'warning':
			return <CircleExclamation fill='#E3A008' />;
		default:
			return <CircleCheck fill='#1C64F2' />;
	}
};

export function ToastMessage(props: ToastMessageProps) {
	useEffect(() => {
		const timer = setTimeout(() => {
			props.setToastMessage(undefined);
		}, 3000);

		return () => clearTimeout(timer);
	}, [props.message, props.setToastMessage]);

	return (
		<div
			className='
				fixed 
				top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2
				z-[9999]
				bg-black/70 shadow-lg rounded-md
				flex items-center gap-3 
				min-w-[335px] max-w-[90%]
				px-4 py-2
			'>
			<ToastMessageIcon status={props.status} />
			<p className='body-md-regular text-white'>{props.message}</p>
		</div>
	);
}
