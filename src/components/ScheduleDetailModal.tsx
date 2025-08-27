import { formatDateTime } from '@/utils/date';
import { ISchedule, serviceNames } from './calendar/Shedule';
import { Modal } from './modal/Modal';

export const ScheduleDetailModal = (props: {
	schedule: ISchedule;
	onClose: () => void;
	editModalOpen: () => void;
}) => {
	return (
		<Modal
			title='상세 일정'
			onClose={props.onClose}
			content={
				<div className='flex flex-col gap-4 bg-Gray-50 p-6 rounded-[8px] border border-Gray-200 '>
					<div className='flex flex-col gap-1'>
						<p className='text-Gray-900 body-lg-medium'>서비스</p>
						<p className='text-Gray-500 body-lg-regular'>
							{serviceNames[props.schedule.serviceType]}
						</p>
					</div>
					<div className='flex flex-col gap-1'>
						<p className='text-Gray-900 body-lg-medium'>
							날짜 및 시간
						</p>
						<div className='flex items-center gap-2'>
							<p className='text-Gray-500 body-lg-regular'>
								{formatDateTime(props.schedule.date)}
							</p>
						</div>
					</div>
					<div className='flex flex-col gap-1'>
						<p className='text-Gray-900 body-lg-medium'>메모</p>
						<p className='text-Gray-500 body-lg-regular'>
							{props.schedule.memo}
						</p>
					</div>
				</div>
			}
			firstBtnProps={{ children: '확인', onClick: props.onClose }}
			secondBtnProps={{ children: '닫기', onClick: props.onClose }}
			thirdBtnProps={{ children: '수정', onClick: props.editModalOpen }}
		/>
	);
};
