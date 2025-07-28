import { Button } from '@/components/buttons/Button';
import { ModalFooterProps } from '@/components/modal/ModalFooter';

export function AlertFooter(props: ModalFooterProps) {
	return (
		<div style={{justifyContent: props.thirdBtnProps ? 'space-between' : 'center'}} className='md:w-[640px] w-[416px] p-5 pt-0 flex items-center border border-Gray-200 border-t-0 rounded-bl-[8px] rounded-br-[8px]'>
			{props.thirdBtnProps && <Button variant='primaryOutline' {...props.thirdBtnProps} />}
			<div className='flex items-center gap-3'>
				{props.secondBtnProps && <Button variant='primaryOutline' {...props.secondBtnProps} />}
				<Button {...props.firstBtnProps} />
			</div>
		</div>
	);
}
