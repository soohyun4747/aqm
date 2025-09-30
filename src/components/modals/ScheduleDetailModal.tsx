import { formatDateTime } from '@/src/utils/date';
import {
	ConfirmedBadge,
	ISchedule,
	RequestedBadge,
	serviceNames,
} from '../calendar/ScheduleCard';
import { Modal } from '../modal/Modal';
import { useEffect, useState } from 'react';
import { ICompany, userTypes, useUserStore } from '@/src/stores/userStore';
import { fetchCompanyInfobyId } from '@/src/utils/supabase/company';
import {
	useScheduleDeleteModalOpenStore,
	useScheduleEditModalOpenStore,
} from '@/src/stores/modalOpenStore';

interface ScheduleDetailModalProps {
	schedule: ISchedule;
	onClose: () => void;
	onConfirm?: (schedule: ISchedule) => Promise<void>;
}

export const ScheduleDetailModal = (props: ScheduleDetailModalProps) => {
	const user = useUserStore((state) => state.user);

	return (
		<>
			{user?.userType === userTypes.admin ? (
				<ScheduleDetailModalAdmin {...props} />
			) : (
				<ScheduleDetailModalCompany {...props} />
			)}
		</>
	);
};

const ScheduleDetailModalCompany = (props: ScheduleDetailModalProps) => {
	const setScheduleEditModalOpen = useScheduleEditModalOpenStore(
		(state) => state.setOpen
	);

	return (
		<Modal
			title='상세 일정'
			onClose={props.onClose}
			firstBtnProps={{ children: '확인', onClick: props.onClose }}
			secondBtnProps={{ children: '닫기', onClick: props.onClose }}
			thirdBtnProps={{
				children: '수정',
				onClick: () => setScheduleEditModalOpen(true),
			}}>
			<div className='flex flex-col gap-4 bg-Gray-50 p-6 rounded-[8px] border border-Gray-200 '>
				<div className='flex justify-between'>
					<div className='flex flex-col gap-1'>
						<p className='text-Gray-900 body-lg-medium'>서비스</p>
						<p className='text-Gray-500 body-lg-regular'>
							{serviceNames[props.schedule.serviceType]}
						</p>
					</div>
					{props.schedule.status === 'confirmed' ? (
						<ConfirmedBadge />
					) : (
						<RequestedBadge />
					)}
				</div>
				<div className='flex flex-col gap-1'>
					<p className='text-Gray-900 body-lg-medium'>날짜 및 시간</p>
					<div className='flex items-center gap-2'>
						<p className='text-Gray-500 body-lg-regular'>
							{formatDateTime(props.schedule.scheduledAt)}
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
		</Modal>
	);
};

const ScheduleDetailModalAdmin = (props: ScheduleDetailModalProps) => {
	const [company, setCompany] = useState<ICompany>();
	const setScheduleEditModalOpen = useScheduleEditModalOpenStore(
		(state) => state.setOpen
	);
	const setScheduleDeleteModalOpen = useScheduleDeleteModalOpenStore(
		(state) => state.setOpen
	);

	useEffect(() => {
		getSetCompanyInfo(props.schedule);
	}, [props.schedule]);

	const getSetCompanyInfo = async (schedule: ISchedule) => {
		const companyInfo = await fetchCompanyInfobyId(schedule.companyId);
		setCompany(companyInfo);
	};

	return (
		<Modal
			title='상세 일정'
			onClose={props.onClose}
			firstBtnProps={{
				children:
					props.schedule.status === 'confirmed' ? '확인' : '확정',
				onClick: () => {
					if (props.schedule.status === 'confirmed') {
						props.onClose();
					} else {
						props.onConfirm && props.onConfirm(props.schedule);
					}
				},
			}}
			secondBtnProps={{
				children: '수정',
				onClick: () => setScheduleEditModalOpen(true),
			}}
			thirdBtnProps={{
				children: '삭제',
				variant: 'danger',
				onClick: () => setScheduleDeleteModalOpen(true),
			}}>
			<div className='flex flex-col gap-4 bg-Gray-50 p-6 rounded-[8px] border border-Gray-200 '>
				<div className='flex flex-col gap-1 flex-1'>
					<p className='text-Gray-900 body-lg-medium'>고객</p>
					<p className='text-Gray-500 body-lg-regular'>
						{company?.name} ({company?.phone})
					</p>
				</div>
				<div className='flex flex-col gap-1 flex-1'>
					<p className='text-Gray-900 body-lg-medium'>주소</p>
					<p className='text-Gray-500 body-lg-regular'>
						{company?.address}
					</p>
				</div>
				<div className='flex flex-col gap-1 flex-1'>
					<p className='text-Gray-900 body-lg-medium'>서비스</p>
					<p className='text-Gray-500 body-lg-regular'>
						{serviceNames[props.schedule.serviceType]}
					</p>
				</div>
				<div className='flex flex-col gap-1 flex-1'>
					<p className='text-Gray-900 body-lg-medium'>날짜 및 시간</p>
					<div className='flex items-center gap-2'>
						<p className='text-Gray-500 body-lg-regular'>
							{formatDateTime(props.schedule.scheduledAt)}
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
		</Modal>
	);
};
