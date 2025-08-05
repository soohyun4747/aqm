import { Button, ButtonProps } from '@/components/buttons/Button';

export interface ModalFooterProps {
	firstBtnProps: ButtonProps;
	secondBtnProps?: ButtonProps;
	thirdBtnProps?: ButtonProps;
}

export function ModalFooter(props: ModalFooterProps) {
	return (
		<div className='md:w-[640px] w-[416px] p-5 pt-0 flex items-center justify-between border border-Gray-200 border-t-0 rounded-bl-[8px] rounded-br-[8px] bg-white'>
			<div>
				{props.thirdBtnProps && (
					<Button
						variant='primaryOutline'
						{...props.thirdBtnProps}
					/>
				)}
			</div>
			<div className='flex items-center gap-3'>
				{props.secondBtnProps && (
					<Button
						variant='primaryOutline'
						{...props.secondBtnProps}
					/>
				)}
				<Button {...props.firstBtnProps} />
			</div>
		</div>
	);
}
