import { JSX } from 'react';
import { ModalFooterProps } from '../modal/ModalFooter';
import { ModalHeader, ModalHeaderProps } from '../modal/ModalHeader';
import { AlertFooter } from './AlertFooter';

interface AlertProps extends ModalHeaderProps, ModalFooterProps {
	content: JSX.Element;
}

export function Alert(props: AlertProps) {
	return (
		<div className='fixed top-0 left-0 w-[100vw] h-[100vh] bg-black/40 flex items-center justify-center px-[20px] md:px-0 z-[2]'>
			<div className='flex flex-col w-[416px] md:w-[640px]'>
				<ModalHeader />
				<div className='p-5 border-l border-r border-Gray-200 bg-white'>
					{props.content}
				</div>
				<AlertFooter
					firstBtnProps={props.firstBtnProps}
					secondBtnProps={props.secondBtnProps}
					thirdBtnProps={props.thirdBtnProps}
				/>
			</div>
		</div>
	);
}
