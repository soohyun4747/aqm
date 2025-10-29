import { useCallback, useEffect, useState } from 'react';
import { Dropdown, Option } from '../Dropdown';
import { Modal } from '../modal/Modal';
import { fmtYMD, isKRHoliday, isWeekend, today } from '@/src/utils/date';
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
import dayjs from 'dayjs';
import tz from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useConfirmedDays } from '@/src/hooks/useConfirmedDays';
import { IToastMessage, ToastMessage } from '../ToastMessage';
dayjs.extend(utc);
dayjs.extend(tz);

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
	const [date, setDate] = useState(new Date());
	const [serviceType, setServiceType] = useState('');
	const [memo, setMemo] = useState('');
	const [toastMessage, setToastMessage] = useState<IToastMessage>();

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

	// ✅ confirmed 날짜들 로드
	const { confirmedYmdSet, setMonth } = useConfirmedDays(companyId);

	// ✅ 비활성화 규칙: 주말, 공휴일, confirmed
	const isDateDisabled = useCallback(
		(d: Date) => {
			const ymd = fmtYMD(d);
			return isWeekend(d) || isKRHoliday(d) || confirmedYmdSet.has(ymd);
		},
		[confirmedYmdSet]
	);

	// ✅ 달 이동시 해당 월 confirmed 재조회
	const handleMonthChange = useCallback(
		(y: number, m0: number) => {
			setMonth(y, m0);
		},
		[setMonth]
	);

	// 선택한 날짜가 막힌 경우 자동 보정(예: 달 바꿨더니 선택일이 confirmed가 됨)
	useEffect(() => {
		if (isDateDisabled(date)) {
			// 다음 가능한 평일/영업일로 이동 (최대 31일 탐색)
			for (let i = 1; i <= 31; i++) {
				const cand = dayjs(date)
					.tz('Asia/Seoul')
					.add(i, 'day')
					.toDate();

				if (!isDateDisabled(cand)) {
					setDate(cand);
					break;
				}
			}
		}
	}, [date, isDateDisabled]);

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
						isDateDisabled={isDateDisabled} // ⬅️ 핵심
						onInvalidSelect={(d) => {
							setToastMessage({
								status: 'warning',
								message: `${d.toLocaleDateString()}는 영업일이 아니거나 예약이 마감된 날짜입니다`,
							});
						}}
						onMonthChange={handleMonthChange}
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
				{toastMessage && (
					<ToastMessage
						status={toastMessage.status}
						message={toastMessage.message}
						setToastMessage={setToastMessage}
					/>
				)}
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
