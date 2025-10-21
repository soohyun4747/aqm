import { useEffect, useState } from 'react';
import { Dropdown, Option } from '../Dropdown';
import { Modal } from '../modal/Modal';
import { today } from '@/src/utils/date';
import { DatePicker } from '../DatePicker';
import { TimePicker } from '../TimePicker';
import { InputBox } from '../InputBox';
import { useUserStore } from '@/src/stores/userStore';
import { fetchCompanyOptions } from '@/src/utils/supabase/company';
import { useSelectedScheduleStore } from '@/src/stores/selectedScheduleStore';
import { useSelectedCompanyStore } from '@/src/stores/selectedCompanyStore';
import { useCompanyServiceOptions } from '@/src/hooks/useCompanyServiceOptions';
import { ISchedule } from '@/src/utils/supabase/schedule';
import { ServiceType } from '@/src/utils/supabase/companyServices';
import { DropdownSearchable } from '../DropdownSearchable';

interface ScheduleAddModalProps {
	onClose: () => void;
	onAdd: (schedule: ISchedule) => Promise<void>;
}

export function ScheduleAddModal(props: ScheduleAddModalProps) {
	const user = useUserStore((state) => state.user);

	return user?.userType === 'company' ? (
		<ScheduleAddCompanyModal {...props} />
	) : (
		<ScheduleAddAdminModal {...props} />
	);
}

function ScheduleAddCompanyModal(props: ScheduleAddModalProps) {
	const [date, setDate] = useState(today);
	const [serviceType, setServiceType] = useState('');
	const [memo, setMemo] = useState('');
	const user = useUserStore((state) => state.user);
	const { schedule: selectedSchedule, setSchedule: setSelectedSchedule } =
		useSelectedScheduleStore();
	const company = useSelectedCompanyStore((state) => state.company);

	useEffect(() => {
		if (selectedSchedule) setServiceType(selectedSchedule.serviceType);
		return () => setSelectedSchedule(undefined);
	}, [selectedSchedule, setSelectedSchedule]);

	const companyId = company?.id ?? user?.company?.id;
	const { options: companyServicesOptions } =
		useCompanyServiceOptions(companyId);

	return (
		<Modal
			title='일정 요청'
			onClose={props.onClose}
			secondBtnProps={{ children: '닫기', onClick: props.onClose }}
			firstBtnProps={{
				variant: 'primary',
				children: '요청',
				onClick: () => {
					if (serviceType && user?.company) {
						props.onAdd({
							scheduledAt: date,
							serviceType: serviceType as ServiceType,
							status: 'requested',
							companyId: user.company.id,
							memo,
						});
					}
				},
			}}>
			<div className='flex flex-col gap-4'>
				<div className='flex self-stretch gap-4'>
					<Dropdown
						label={'서비스'}
						options={companyServicesOptions}
						value={serviceType}
						id='service-dropdown'
						onChange={(newServiceType) =>
							setServiceType(newServiceType as ServiceType)
						}
						style={{ flex: 1 }}
					/>
				</div>
				<div className='flex md:flex-row flex-col self-stretch gap-4'>
					<DatePicker
						date={date}
						onChange={setDate}
					/>
					<TimePicker
						date={date}
						onChange={setDate}
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

function ScheduleAddAdminModal(props: ScheduleAddModalProps) {
	const [date, setDate] = useState(today);
	const [serviceType, setServiceType] = useState('');
	const [companyId, setCompanyId] = useState('');
	const [memo, setMemo] = useState('');
	const [companyOptions, setCompanyOptions] = useState<Option[]>([]);
	const { schedule: selectedSchedule, setSchedule: setSelectedSchedule } =
		useSelectedScheduleStore();

	const { options: companyServicesOptions } =
		useCompanyServiceOptions(companyId);

	useEffect(() => {
		getSetCompanyOptions();
	}, []);

	useEffect(() => {
		if (selectedSchedule) {
			setCompanyId(selectedSchedule.companyId);
			setServiceType(selectedSchedule.serviceType);
		}

		return () => {
			setSelectedSchedule(undefined);
		};
	}, [selectedSchedule]);

	const getSetCompanyOptions = async () => {
		const options = await fetchCompanyOptions();
		setCompanyOptions(options);
	};

	return (
		<Modal
			title='새로운 일정'
			onClose={props.onClose}
			secondBtnProps={{
				children: '닫기',
				onClick: props.onClose,
			}}
			firstBtnProps={{
				variant: 'primary',
				children: '확정',
				onClick: () => {
					if (serviceType && companyId) {
						props.onAdd({
							scheduledAt: date,
							serviceType: serviceType as ServiceType,
							status: 'confirmed',
							companyId: companyId,
							memo: memo,
						});
					}
				},
			}}>
			<div className='flex flex-col gap-4'>
				<div className='flex md:flex-row flex-col self-stretch gap-4'>

					<DropdownSearchable
						label={'고객'}
						options={companyOptions}
						value={companyId}
						id='company-dropdown'
						onChange={(compId) => {
							setCompanyId(compId);
						}}
						style={{ flex: 1 }}
					/>
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
				</div>
				<div className='flex md:flex-row flex-col self-stretch gap-4'>
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
