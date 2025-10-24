import { JSX, useEffect, useState } from 'react';
import { Bell } from './icons/Bell';
import { Popover } from './Popover';
import { Building } from './icons/Building';
import { Clock } from './icons/Clock';
import { serviceNames, ServiceType } from '../utils/supabase/companyServices';

function NotiCount({ count, id }: { count: number; id: string }) {
	return (
		<div
			id={id}
			className='bg-Orange-500 size-5 flex items-center justify-center rounded-full'>
			<p
				id={id}
				className='text-[11.667px] font-500 leading-[11.667px] text-white'>
				{count}
			</p>
		</div>
	);
}

interface Notification {
	type: 'request' | 'cancel';
	service: ServiceType;
	notifiedDateTime: Date;
	subject: string;
	dateTime: Date;
}

export const NotificationBell = () => {
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

	const [listOpen, setListOpen] = useState(false);

	useEffect(() => {
		// Add click listener to the document
		document.addEventListener('click', handleClickOutside);

		// Cleanup the listener on component unmount
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	}, []);

	const bellId = 'bell';

	const handleClickOutside = (e: MouseEvent) => {
		const target = e.target as HTMLElement | undefined;

		if (target && target.id === bellId) {
			setListOpen(true);
		} else {
			setListOpen(false); // Change state when clicking outside
		}
	};

	const onClickBell = () => {
		if (notis.length > 0) {
			setListOpen(true);
		}
	};

	return (
		<div className='relative'>
			<div
				id={bellId}
				onClick={onClickBell}
				className='hover:cursor-pointer flex items-center gap-[2px]'>
				<Bell id={bellId} />
				{notis.length > 0 && (
					<NotiCount
						id={bellId}
						count={notis.length}
					/>
				)}
			</div>
			{listOpen && <NotificationList notis={notis} />}
		</div>
	);
};

export const getNotiTitle = (noti: Notification) => {
	let message = '';

	message += serviceNames[noti.service];

	if (noti.type === 'request') {
		message += ' 요청이 왔습니다';
	} else {
		message += ' 취소 요청이 왔습니다';
	}

	return message;
};

export function NotificationList({ notis }: { notis: Notification[] }) {
	return (
		<div className='absolute top-[24px]'>
			<div className='relative'>
				<Popover
					className='absolute top-[12.5px] min-w-[430px] left-[-300px]'
					title={'Notifications'}
					content={
						<div className='flex flex-col gap-2.5'>
							{notis.map((noti, i) => (
								<NotificationListItem
									key={i}
									{...noti}
									title={getNotiTitle(noti)}
								/>
							))}
						</div>
					}
				/>
				<svg
					className='absolute top-[4px]'
					xmlns='http://www.w3.org/2000/svg'
					width='20'
					height='10'
					viewBox='0 0 20 10'
					fill='none'>
					<path
						d='M16.793 9L10 2.20703L3.20703 9H16.793Z'
						fill='#F9FAFB'
						stroke='#E5E7EB'
					/>
					<path
						d='M15.3921 8.99805L9.99951 3.60449L4.60693 8.99805H15.3921Z'
						stroke='#F9FAFB'
					/>
				</svg>
			</div>
		</div>
	);
}

function getRelativeTime(notifiedDateTime: string | Date): string {
	const now = new Date();
	const notifiedTime = new Date(notifiedDateTime);
	const diffMs = now.getTime() - notifiedTime.getTime();

	const seconds = Math.floor(diffMs / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (seconds < 60) {
		return '방금 전';
	} else if (minutes < 60) {
		return `${minutes}분 전`;
	} else if (hours < 24) {
		return `${hours}시간 전`;
	} else {
		return `${days}일 전`;
	}
}

export const NotificationListItem = ({
	title,
	subject,
	dateTime,
	notifiedDateTime,
}: {
	title: string;
	subject: string;
	dateTime: Date;
	notifiedDateTime: Date;
}) => {
	return (
		<div className='border border-Gray-200 rounded-[8px] bg-Gray-50 p-4 flex flex-col gap-[8px]'>
			<div className='flex items-center justify-between'>
				<p className='body-md-medium md:body-lg-medium text-Gray-900'>
					{title}
				</p>
				<p className='body-sm-regular md:body-md-regular text-Gray-500'>
					{getRelativeTime(notifiedDateTime)}
				</p>
			</div>
			<div className='flex items-center gap-3'>
				<div className='flex items-center gap-1'>
					<Building
						size={12}
						fill='#6B7280'
					/>
					<p className='body-sm-regular md:body-md-regular text-Gray-500'>
						{subject}
					</p>
				</div>
				<div className='flex items-center gap-1'>
					<Clock
						size={12}
						fill='#6B7280'
					/>
					<p className='body-sm-regular md:body-md-regular text-Gray-500'>
						{dateTime.toLocaleString()}
					</p>
				</div>
			</div>
		</div>
	);
};
