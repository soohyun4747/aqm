import { JSX } from 'react';
import { ModalFooter, ModalFooterProps } from './ModalFooter';
import { ModalHeader, ModalHeaderProps } from './ModalHeader';

interface ModalProps extends ModalHeaderProps, ModalFooterProps {
	children: JSX.Element;
}

export function Modal(props: ModalProps) {
	return (
		<div className='fixed top-0 left-0 w-[100vw] h-[100vh] bg-black/40 flex items-center justify-center px-[20px] md:px-0 z-[2]'>
			<div className='flex flex-col min-w-[416px] w-[416px]'>
				<ModalHeader
					title={props.title}
					onClose={props.onClose}
				/>
				<div className='p-5 border-l border-r border-Gray-200 bg-white'>
					{props.children}
				</div>
				<ModalFooter
					firstBtnProps={props.firstBtnProps}
					secondBtnProps={props.secondBtnProps}
					thirdBtnProps={props.thirdBtnProps}
				/>
			</div>
		</div>
	);
}
