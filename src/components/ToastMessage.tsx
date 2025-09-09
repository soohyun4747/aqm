import { Dispatch, SetStateAction, useEffect } from 'react';
import { CircleCheck } from './icons/CircleCheck';
import { CircleExclamation } from './icons/CircleExclamation';
import { CircleX } from './icons/CircleX';

export type ToastMessageStatusType = 'error' | 'confirm' | 'warning';

export interface ToastMessageProps {
	status: ToastMessageStatusType;
	message: string;
	setToastMessage: Dispatch<
		SetStateAction<
			| {
					status: ToastMessageStatusType;
					message: string;
			  }
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

		return () => clearTimeout(timer); // cleanup
	}, [props.message, props.setToastMessage]);

	return (
		<div className='flex items-center gap-3 min-w-[335px] px-4 py-2'>
			<ToastMessageIcon status={props.status} />
			<p>{props.message}</p>
		</div>
	);
}
