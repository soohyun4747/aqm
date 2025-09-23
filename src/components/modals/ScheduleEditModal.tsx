import { useMemo, useState } from 'react';
import { ISchedule, getServiceDropdownOptions } from '../calendar/Schedule';
import { Dropdown } from '../Dropdown';
import { Modal } from '../modal/Modal';
import { DatePicker } from '../DatePicker';
import { TimePicker } from '../TimePicker';
import { InputBox } from '../InputBox';
import { ServiceType } from '@/src/pages/admin/companies/edit';

export function ScheduleEditModal(props: {
	schedule: ISchedule;
	onClose: () => void;
	onEdit: (updatedSchedule: ISchedule) => void;
}) {
	const [date, setDate] = useState(props.schedule.scheduledAt);
	const [serviceType, setServiceType] = useState(props.schedule.serviceType);
	const [memo, setMemo] = useState(props.schedule.memo || '');

	return (
		<Modal
			title='일정 수정'
			onClose={props.onClose}
			firstBtnProps={{
				variant: 'primary',
				children: '수정 요청',
			}}>
			<div className='flex flex-col gap-4'>
				<Dropdown
					label={'서비스'}
					options={getServiceDropdownOptions()}
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
