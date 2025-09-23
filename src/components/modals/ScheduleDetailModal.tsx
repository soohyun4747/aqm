import { formatDateTime } from '@/src/utils/date';
import { ISchedule, serviceNames } from '../calendar/Schedule';
import { Modal } from '../modal/Modal';
import { useEffect, useState } from 'react';
import { ICompany, userTypes, useUserStore } from '@/src/stores/userStore';
import { fetchCompanyInfobyId } from '@/src/utils/supabase/company';

interface ScheduleDetailModalProps {
	schedule: ISchedule;
	onClose: () => void;
	editModalOpen: () => void;
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
	return (
		<Modal
			title='상세 일정'
			onClose={props.onClose}
			firstBtnProps={{ children: '확인', onClick: props.onClose }}
			secondBtnProps={{ children: '닫기', onClick: props.onClose }}
			thirdBtnProps={{ children: '수정', onClick: props.editModalOpen }}>
			<div className='flex flex-col gap-4 bg-Gray-50 p-6 rounded-[8px] border border-Gray-200 '>
				<div className='flex flex-col gap-1'>
					<p className='text-Gray-900 body-lg-medium'>서비스</p>
					<p className='text-Gray-500 body-lg-regular'>
						{serviceNames[props.schedule.serviceType]}
					</p>
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
			firstBtnProps={{ children: '확인', onClick: props.onClose }}
			secondBtnProps={{ children: '닫기', onClick: props.onClose }}
			thirdBtnProps={{ children: '수정', onClick: props.editModalOpen }}>
			<div className='flex flex-col gap-4 bg-Gray-50 p-6 rounded-[8px] border border-Gray-200 '>
				<div className='flex gap-4'>
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
				</div>
				<div className='flex gap-4'>
					<div className='flex flex-col gap-1 flex-1'>
						<p className='text-Gray-900 body-lg-medium'>서비스</p>
						<p className='text-Gray-500 body-lg-regular'>
							{serviceNames[props.schedule.serviceType]}
						</p>
					</div>
					<div className='flex flex-col gap-1 flex-1'>
						<p className='text-Gray-900 body-lg-medium'>
							날짜 및 시간
						</p>
						<div className='flex items-center gap-2'>
							<p className='text-Gray-500 body-lg-regular'>
								{formatDateTime(props.schedule.scheduledAt)}
							</p>
						</div>
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
