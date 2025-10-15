import { useEffect, useState } from 'react';
import { Dropdown, Option } from '../Dropdown';
import { Modal } from '../modal/Modal';
import { DatePicker } from '../DatePicker';
import { TimePicker } from '../TimePicker';
import { InputBox } from '../InputBox';
import { ICompany, useUserStore } from '@/src/stores/userStore';
import { fetchCompanyInfobyId } from '@/src/utils/supabase/company';
import { useCompanyServiceOptions } from '@/src/hooks/useCompanyServiceOptions';
import { useSelectedCompanyStore } from '@/src/stores/selectedCompanyStore';
import { ISchedule } from '@/src/utils/supabase/schedule';
import { ServiceType } from '@/src/utils/supabase/companyServices';
import { useSelectedScheduleStore } from '@/src/stores/selectedScheduleStore';

interface ScheduleEditModalProps {
	schedule: ISchedule;
	onClose: () => void;
	onEdit: (schedule: ISchedule) => Promise<void>;
	onCancelSchedule?: () => void;
}

export function ScheduleEditModal(props: ScheduleEditModalProps) {
	const user = useUserStore((state) => state.user);

	return user?.userType === 'company' ? (
		<ScheduleEditCompanyModal {...props} />
	) : (
		<ScheduleEditAdminModal {...props} />
	);
}

function ScheduleEditCompanyModal(props: ScheduleEditModalProps) {
	const [date, setDate] = useState<Date>(props.schedule.scheduledAt);
	const [serviceType, setServiceType] = useState<ServiceType>(
		props.schedule.serviceType
	);
	const [memo, setMemo] = useState<string>(props.schedule.memo ?? '');
	const user = useUserStore((state) => state.user);
	const company = useSelectedCompanyStore((state) => state.company);

	const { options: companyServicesOptions } = useCompanyServiceOptions(
		company?.id
	);

	return (
		<Modal
			title='일정 수정'
			onClose={props.onClose}
			firstBtnProps={{
				variant: 'primary',
				children: '수정 요청',
				onClick: async () => {
					if (serviceType && user?.company) {
						await props.onEdit({
							id: props.schedule.id,
							scheduledAt: date,
							serviceType: serviceType as ServiceType,
							status: 'requested',
							companyId: user.company.id,
							memo: memo,
						});
					}
				},
			}}
			thirdBtnProps={{
				variant: 'danger',
				children: '일정 취소',
				onClick: () =>
					props.onCancelSchedule &&
					props.onCancelSchedule(),
			}}>
			<div className='flex flex-col gap-4'>
				<Dropdown
					label={'서비스'}
					options={companyServicesOptions}
					value={serviceType}
					id='service-dropdown'
					onChange={(newServiceType) => {
						setServiceType(newServiceType as ServiceType);
					}}
				/>
				<div className='flex self-stretch gap-4'>
					<DatePicker
						date={date}
						onChange={(newDate) => {
							setDate(newDate);
						}}
					/>
					<TimePicker
						date={date}
						onChange={(newDate) => {
							setDate(newDate);
						}}
					/>
				</div>
				<InputBox
					label='메모'
					inputAttr={{
						placeholder: '메모 입력',
						value: memo,
						onChange: (e) => setMemo(e.target.value),
					}}
				/>
			</div>
		</Modal>
	);
}

function ScheduleEditAdminModal(props: ScheduleEditModalProps) {
	const [date, setDate] = useState(props.schedule.scheduledAt);
	const [serviceType, setServiceType] = useState(props.schedule.serviceType);
	const [memo, setMemo] = useState(props.schedule.memo || '');
	const [company, setCompany] = useState<ICompany>();

	const { options: companyServicesOptions } = useCompanyServiceOptions(
		company?.id
	);

	useEffect(() => {
		if (props.schedule) {
			getSetCompanyInfo(props.schedule.companyId);
		}
	}, [props.schedule]);

	const getSetCompanyInfo = async (companyId: string) => {
		const data = await fetchCompanyInfobyId(companyId);
		setCompany(data);
	};

	return (
		<Modal
			title='일정 수정'
			onClose={props.onClose}
			firstBtnProps={{
				variant: 'primary',
				children: '수정 확정',
				onClick: async () => {
					if (serviceType) {
						await props.onEdit({
							id: props.schedule.id,
							scheduledAt: date,
							serviceType: serviceType as ServiceType,
							status: 'confirmed',
							companyId: props.schedule.companyId,
							memo: memo,
						});
					}
				},
			}}>
			<div className='flex flex-col gap-4'>
				<div className='flex flex-col gap-2 flex-1'>
					<p className='text-Gray-900 body-lg-medium'>고객</p>
					<p className='text-Gray-500 body-lg-regular'>
						{company?.name} ({company?.phone})
					</p>
				</div>
				<Dropdown
					label={'서비스'}
					options={companyServicesOptions}
					value={serviceType}
					id='service-dropdown'
					onChange={(newServiceType) => {
						setServiceType(newServiceType as ServiceType);
					}}
					style={{ flex: 1 }}
				/>
				<div className='flex self-stretch gap-4'>
					<DatePicker
						date={date}
						onChange={(newDate) => {
							setDate(newDate);
						}}
					/>
					<TimePicker
						date={date}
						onChange={(newDate) => {
							setDate(newDate);
						}}
					/>
				</div>
				{/* <InputBox
					label='메모'
					inputAttr={{
						placeholder: '메모 입력',
						value: memo,
						onChange: (e) => setMemo(e.target.value),
					}}
				/> */}
			</div>
		</Modal>
	);
}
