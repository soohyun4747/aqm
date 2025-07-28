import { JSX } from 'react';
import { ModalFooter, ModalFooterProps } from './ModalFooter';
import { ModalHeader, ModalHeaderProps } from './ModalHeader';

interface ModalProps extends ModalHeaderProps, ModalFooterProps {
	content: JSX.Element;
}

export function Modal(props: ModalProps) {
	return (
		<div className='flex flex-col w-[416px] md:w-[640px]'>
			<ModalHeader />
			<div className='p-5 border-l border-r border-Gray-200'>{props.content}</div>
			<ModalFooter
				firstBtnProps={props.firstBtnProps}
				secondBtnProps={props.secondBtnProps}
				thirdBtnProps={props.thirdBtnProps}
			/>
		</div>
	);
}
