import { useState } from 'react';
import { Bell } from './icons/Bell';
import { BellAlert } from './icons/BellAlert';
import { ModalHeader } from './modal/ModalHeader';
import {
	getNotiTitle,
	NotificationList,
	NotificationListItem,
} from './Notification';
import { IconButton } from './IconButton';

export function NotificationMob() {
	//notis는 global state로 관리
	const notis = [
		{
			type: 'request' as 'request' | 'cancel',
			service: 'aqm' as 'aqm' | 'hepa' | 'voc' | 'as',
			subject: '서울중앙병원',
			dateTime: new Date(),
			notifiedDateTime: new Date(),
		},
	];

	const [modalOpen, setModalOpen] = useState(false);

	const onClickBell = () => {
		setModalOpen(true);
	};

	return (
		<>
			{notis.length > 0 ? (
				<IconButton
					icon={<BellAlert />}
					onClick={() => setModalOpen(true)}
				/>
			) : (
				<Bell />
			)}
			{modalOpen && (
				<div className='fixed top-0 left-0 w-[100vw] h-[100vh] bg-black/40 flex items-center justify-center px-[20px] md:px-0 z-[2]'>
					<div className='flex flex-col w-[340px]'>
						<ModalHeader
							title='Notifications'
							onClose={() => setModalOpen(false)}
						/>
						<div className='p-4 flex flex-col gap-4 bg-white rounded-b-[8px] border border-Gray-200 border-t-0'>
							{notis.map((noti) => (
								<NotificationListItem
									{...noti}
									title={getNotiTitle(noti)}
								/>
							))}
						</div>
					</div>
				</div>
			)}
		</>
	);
}
