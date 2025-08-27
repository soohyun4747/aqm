import { useMemo, useState } from 'react';
import { ISchedule, serviceNames } from './calendar/Shedule';
import { Dropdown } from './Dropdown';
import { Modal } from './modal/Modal';
import { DatePicker } from './DatePicker';
import { TimePicker } from './TimePicker';
import { InputBox } from './InputBox';
import { ServiceType } from './Notification';

export function ScheduleEditModal(props: {
	schedule: ISchedule;
	onClose: () => void;
	onEdit: (updatedSchedule: ISchedule) => void;
}) {
	const [date, setDate] = useState(props.schedule.date);
	const [serviceType, setServiceType] = useState(props.schedule.serviceType);
	const [scheduleType, setScheduleType] = useState(
		props.schedule.scheduleType
	);
	const [memo, setMemo] = useState(props.schedule.memo || '');

	const serviceDropdownOptions = useMemo(
		() =>
			Object.keys(serviceNames).map((serviceId) => ({
				label: serviceNames[serviceId],
				value: serviceId,
			})),
		[]
	);

	return (
		<Modal
			title='일정 수정'
			onClose={props.onClose}
			content={
				<div className='flex flex-col gap-4'>
					<Dropdown
						label={'서비스'}
						options={serviceDropdownOptions}
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
			}
			firstBtnProps={{
				variant: 'primary',
				children: '수정 요청',
			}}
		/>
	);
}
