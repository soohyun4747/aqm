import { IconButton } from '../IconButton';
import { Close } from '../icons/Close';

export interface ModalHeaderProps {
	title?: string;
	onClose?: () => void;
}

export function ModalHeader(props: ModalHeaderProps) {
	return (
		<div className='flex items-center justify-between p-5 rounded-tl-[8px] rounded-tr-[8px] border border-Gray-200 border-b-0 w-[340px] md:w-[640px] bg-white'>
			<p className='text-Gray-900 body-lg-semibold md:heading-md'>
				{props.title}
			</p>
			<IconButton
				onClick={props.onClose}
				icon={Close({ fill: '#9CA3AF', size: 12 })}
			/>
		</div>
	);
}
