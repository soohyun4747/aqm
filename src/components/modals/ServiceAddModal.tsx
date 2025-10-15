import { useState } from 'react';
import { Modal } from '../modal/Modal';
import { Radio } from '../Radio';
import { Services, ServiceType } from '@/src/utils/supabase/companyServices';

interface ServiceAddModalProps {
	onConfirm: (serviceType: ServiceType) => void;
	onCancel: () => void;
}

export function ServiceAddModal(props: ServiceAddModalProps) {
	const [selectedServiceType, setSelectedServiceType] =
		useState<ServiceType>();

	return (
		<Modal
			title='서비스 추가'
			onClose={props.onCancel}
			secondBtnProps={{
				children: '취소',
				onClick: props.onCancel,
				variant: 'alternative',
			}}
			firstBtnProps={{
				disabled: selectedServiceType ? false : true,
				children: '확인',
				onClick: () =>
					selectedServiceType && props.onConfirm(selectedServiceType),
			}}>
			<div className='flex flex-col self-stretch gap-4 '>
				<p>추가하고자 하는 서비스 유형을 선택해주세요</p>
				<Radio
					label={'AQM 검사'}
					onClick={() => setSelectedServiceType(Services.aqm)}
					selected={selectedServiceType === Services.aqm}
				/>
				<Radio
					label={'HEPA 필터'}
					onClick={() => setSelectedServiceType(Services.hepa)}
					selected={selectedServiceType === Services.hepa}
				/>
				<Radio
					label={'VOC 필터'}
					onClick={() => setSelectedServiceType(Services.voc)}
					selected={selectedServiceType === Services.voc}
				/>
			</div>
		</Modal>
	);
}
