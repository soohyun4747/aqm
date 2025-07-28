import { JSX } from 'react';
import { ModalFooterProps } from '../modal/ModalFooter';
import { ModalHeader, ModalHeaderProps } from '../modal/ModalHeader';
import { AlertFooter } from './AlertFooter';

interface AlertProps extends ModalHeaderProps, ModalFooterProps {
	content: JSX.Element;
}

export function Alert(props: AlertProps) {
	return (
		<div className='flex flex-col w-[416px] md:w-[640px]'>
			<ModalHeader />
			<div className='p-5 border-l border-r border-Gray-200'>{props.content}</div>
			<AlertFooter
				firstBtnProps={props.firstBtnProps}
				secondBtnProps={props.secondBtnProps}
				thirdBtnProps={props.thirdBtnProps}
			/>
		</div>
	);
}
