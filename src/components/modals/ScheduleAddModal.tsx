import { useEffect, useState } from 'react';
import { ISchedule, getServiceDropdownOptions } from '../calendar/Schedule';
import { Dropdown, Option } from '../Dropdown';
import { Modal } from '../modal/Modal';
import { today } from '@/src/utils/date';
import { DatePicker } from '../DatePicker';
import { TimePicker } from '../TimePicker';
import { InputBox } from '../InputBox';
import { fetchCompanyOptions } from '@/src/utils/supabase/company';
import { ServiceType } from '@/src/pages/admin/companies/edit';

interface ScheduleAddModalProps {
	onClose: () => void;
	onAdd: (schedule: ISchedule) => Promise<void>;
}

export function ScheduleAddModal(props: ScheduleAddModalProps) {
	const [date, setDate] = useState(today);
	const [serviceType, setServiceType] = useState('');
	const [companyId, setCompanyId] = useState('');
	const [memo, setMemo] = useState('');
	const [companyOptions, setCompanyOptions] = useState<Option[]>([]);

	useEffect(() => {
		getSetCompanyOptions();
	}, []);

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
						});
					}
				},
			}}>
			<div className='flex flex-col gap-4'>
				<div className='flex self-stretch gap-4'>
					<Dropdown
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
						options={getServiceDropdownOptions()}
						value={serviceType}
						id='service-dropdown'
						onChange={(newServiceType) => {
							setServiceType(newServiceType as ServiceType);
						}}
						style={{ flex: 1 }}
					/>
				</div>
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
