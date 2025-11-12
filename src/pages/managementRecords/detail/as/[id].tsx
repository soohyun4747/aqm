import { Card } from '@/src/components/Card';
import { GNB } from '@/src/components/GNB';
import { IToastMessage, ToastMessage } from '@/src/components/ToastMessage';
import { useManagementRecordStore } from '@/src/stores/managementRecordStore';
import { toLocaleStringWithoutSec } from '@/src/utils/date';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Calendar } from '@/src/components/icons/Calendar';
import { fetchManagementRecordById, IManagementRecordRow } from '@/src/utils/supabase/managementRecord';
import { usePathname } from 'next/navigation';

function AdminManagementRecordsEditASPage() {
	const [toastMessage, setToastMessage] = useState<IToastMessage>();
	const [managementRecord, setManagementRecord] =
		useState<IManagementRecordRow>();
	const pathname = usePathname();
	const recordId = pathname?.split('/').at(4);

	useEffect(() => {
		if (recordId) {
			getSetManagementRecordAndResult(recordId);
		}
	}, [recordId]);

	const getSetManagementRecordAndResult = async (recordId: string) => {
		try {
			const recordInfo = await fetchManagementRecordById(recordId);
			if (recordInfo) {
				setManagementRecord(recordInfo);
			}
		} catch (error) {
			console.error(error);
			setToastMessage({ status: 'error', message: '데이터 로드 실패' });
		}
	};

	return (
		<div>
			<GNB />
			<div className='flex flex-col bg-Gray-100 min-h-screen pt-[60px] md:pt-0'>
				<div className='flex justify-between items-center px-6 py-4 bg-white'>
					<p className='text-Gray-900 heading-md'>
						장비 설치 및 AS 기록
					</p>
				</div>

				<div className='p-6 flex md:flex-row flex-col gap-4'>
					<div className='flex flex-col gap-4 w-[330px]'>
						<Card>
							<div className='flex flex-col gap-[12px]'>
								<div className='flex flex-col gap-1'>
									<p className='text-Gray-900 body-lg-medium'>
										서비스
									</p>
									<p className='text-Gray-500 body-lg-regular'>
										HEPA 필터 교체
									</p>
								</div>
								<div className='flex flex-col gap-1'>
									<p className='text-Gray-900 body-lg-medium'>
										관리자
									</p>
									<p className='text-Gray-500 body-lg-regular'>
										{managementRecord?.manager_name}
									</p>
								</div>
								<div className='flex flex-col'>
									<p className='text-Gray-900 body-lg-medium'>
										시행일
									</p>
									<div className='flex items-center gap-2'>
										<Calendar
											fill='#9CA3AF'
											size={12}
										/>
										<p className='text-Gray-500 body-lg-regular'>
											{managementRecord &&
												new Date(
													managementRecord?.date
												).toLocaleDateString()}
										</p>
									</div>
								</div>
								<div className='flex flex-col'>
									<p className='text-Gray-900 body-lg-medium'>
										작성일
									</p>
									<div className='flex items-center gap-2'>
										<Calendar
											fill='#9CA3AF'
											size={12}
										/>
										<p className='text-Gray-500 body-lg-regular'>
											{managementRecord?.created_at &&
												toLocaleStringWithoutSec(
													new Date(
														managementRecord.created_at
													)
												)}
										</p>
									</div>
								</div>
							</div>
						</Card>
					</div>
					<div className='flex flex-col gap-4 flex-1'>
						<Card className='flex-1'>
							<div className='flex flex-col gap-[6px]'>
								<p className='heading-md text-Gray-900'>
									코멘트
								</p>
								<p className='text-Gray-500 body-lg-regular'>
									{managementRecord?.comment}
								</p>
							</div>
						</Card>
					</div>
				</div>
				{toastMessage && (
					<ToastMessage
						status={toastMessage.status}
						message={toastMessage.message}
						setToastMessage={setToastMessage}
					/>
				)}
			</div>
		</div>
	);
}

export default AdminManagementRecordsEditASPage;
