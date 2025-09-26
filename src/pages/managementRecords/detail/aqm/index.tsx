import { BarChart } from '@/src/components/BarChart';
import { Button } from '@/src/components/buttons/Button';
import { Card } from '@/src/components/Card';
import { DataGrid } from '@/src/components/datagrid/DataGrid';
import { Table } from '@/src/components/datagrid/Table';
import { GNB } from '@/src/components/GNB';
import { Calendar } from '@/src/components/icons/Calendar';
import { StatusLabel } from '@/src/components/StatusLabel';
import { IToastMessage, ToastMessage } from '@/src/components/ToastMessage';
import { IManagementRecord } from '@/src/pages/admin/managementRecords';
import { MicrobioAnalysisType } from '@/src/pages/admin/managementRecords/edit/aqm';
import { useManagementRecordStore } from '@/src/stores/managementRecordStore';
import { today, toLocaleStringWithoutSec } from '@/src/utils/date';
import {
	buildAqmData,
	buildPmDataByChannel,
	buildVocData,
	detectUnit,
} from '@/src/utils/file';
import { loadAqmBundleAsFiles } from '@/src/utils/supabase/aqmResults';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const channelSizes = ['0.3um', '0.5um', '5.0um'];

export type Series = { label: string; value: number };

const aqmDangerStandards: { [key: string]: string } = {
	'CO (PPM)': '>10',
	'CO2 (PPM)': '>1000',
	'NO (PPM)': '>0.05',
	'SO2 (PPM)': '>0.15',
	'O3 (PPB)': '>0.1',
	'FMH (PPB)': '>80',
};

function ManagementRecordDetailAqmPage() {
	const [date, setDate] = useState<Date>(today);
	const [companyId, setCompanyId] = useState('');
	const [manager, setManager] = useState('');
	const [comment, setComment] = useState('');
	const [microbioFile, setMicrobioFile] = useState<File | null>(null);
	const [microbioAnal, setMicrobioAnal] = useState<MicrobioAnalysisType>();

	const [pmDataByChannel, setPmDataByChannel] = useState<
		Record<string, Series[]>
	>({});
	const [vocData, setVocData] = useState<Series[]>([]);
	const [aqmData, setAqmData] = useState<Series[]>([]);

	const [toastMessage, setToastMessage] = useState<IToastMessage>();

	const { managementRecord, setManagementRecord } =
		useManagementRecordStore();

	useEffect(() => {
		return () => {
			setManagementRecord(undefined);
		};
	}, []);

	useEffect(() => {
		if (managementRecord) {
			loadAqmResult(managementRecord);
		}
	}, [managementRecord]);

	const loadAqmResult = async (managementRecord: IManagementRecord) => {
		try {
			const { record, result, files } = await loadAqmBundleAsFiles(
				managementRecord.id
			);
			setDate(new Date(record.date));
			setCompanyId(record.company_id);
			setManager(record.manager_name ?? '');
			setMicrobioAnal(result?.microbio_analysis ?? undefined);
			setComment(record.comment);

			setMicrobioFile(files.microbioFile);

			// ⬇️ PM 차트 데이터 구성
			if (files.pmFile) {
				const charts = await buildPmDataByChannel(files.pmFile);
				setPmDataByChannel(charts); // 채널별 {data(3개), max, unit}
			} else {
				setPmDataByChannel({});
			}
			// 데이터 로드 이후
			if (files.vocFile) {
				const data = await buildVocData(files.vocFile);
				setVocData(data);
			}

			if (files.aqmFile) {
				buildAqmData(files.aqmFile).then(setAqmData);
			}
		} catch (e) {
			console.error(e);
			setToastMessage({ status: 'error', message: '데이터 로드 실패' });
		}
	};
	// ... 기존 상태/스토어 로직들 유지
	const handlePrint = () => {
		// 인쇄 전에 화면을 프린트 레이아웃으로 바꾼 뒤 브라우저 프린트 다이얼로그 호출
		window.print();
	};

	return (
		<div className='flex flex-col bg-Gray-100 min-h-screen'>
			<GNB />
			<div className='flex justify-between items-center px-6 py-4 bg-white no-print'>
				<p className='text-Gray-900 heading-md'>AQM 검사 기록</p>
				<Button onClick={handlePrint}>프린트</Button>
			</div>
			<div
				id='print-area'
				className='p-6 flex flex-col gap-5'>
				<div className='flex gap-4'>
					<div className='flex flex-col gap-4 w-[330px]'>
						<Card>
							<div className='flex flex-col gap-[12px]'>
								<div className='flex flex-col'>
									<p className='text-Gray-900 body-lg-medium'>
										서비스
									</p>
									<p className='text-Gray-500 body-lg-regular'>
										AQM 검사
									</p>
								</div>
								<div className='flex flex-col'>
									<p className='text-Gray-900 body-lg-medium'>
										관리자
									</p>
									<p className='text-Gray-500 body-lg-regular'>
										{managementRecord?.managerName}
									</p>
								</div>
								<div className='flex flex-col'>
									<p className='text-Gray-900 body-lg-medium'>
										날짜 및 시간
									</p>
									<div className='flex items-center gap-2'>
										<Calendar
											fill='#9CA3AF'
											size={12}
										/>
										<p className='text-Gray-500 body-lg-regular'>
											{managementRecord &&
												toLocaleStringWithoutSec(
													new Date(
														managementRecord?.date
													)
												)}
										</p>
									</div>
								</div>
							</div>
						</Card>
						<Card className='flex-1'>
							<div className='flex flex-col gap-[6px]'>
								<p className='heading-md text-Gray-900'>
									코멘트
								</p>
								<p className='text-Gray-500 body-lg-regular'>
									{comment}
								</p>
							</div>
						</Card>
						<Card>
							<div className='flex flex-col gap-4'>
								<div className='flex items-center justify-between'>
									<p className='heading-md text-Gray-900'>
										미생물 분석
									</p>
									{microbioAnal && (
										<StatusLabel status={microbioAnal} />
									)}
								</div>
								{microbioFile ? (
									<Image
										src={URL.createObjectURL(microbioFile)}
										alt='미생물 분석 이미지'
										width={280}
										height={180}
										className='rounded object-contain'
									/>
								) : (
									<p className='text-Gray-400 body-lg-regular'>
										미생물 분석 이미지가 없습니다.
									</p>
								)}
							</div>
						</Card>
					</div>
					<div className='flex flex-col gap-4 flex-1'>
						<Card>
							<div className='flex flex-col gap-6'>
								<div className='flex flex-col gap-2 border-b border-Gray-200 pb-4'>
									<p className='heading-md text-Gray-900'>
										PM Measurements
									</p>
									<p className='body-lg-regular text-Gray-500'>
										PM 검사 결과 입니다.
									</p>
								</div>
								<div className='flex flex-col gap-12'>
									{channelSizes.map((size) => (
										<div
											key={size}
											className='flex flex-col gap-1'>
											<p className='text-Primary-700 body-lg-medium'>
												{size}{' '}
												<span className='text-Gray-400 body-lg-regular'>
													(particle size)
												</span>
											</p>
											<BarChart
												safeStandard={'0-50'}
												warningStandard={'51-100'}
												dangerStandard={'>100'}
												maxValue={150}
												unit={'CNT'}
												data={
													pmDataByChannel[size] ?? []
												} // ← 여기 길이가 3 (position1~3)
											/>
										</div>
									))}
								</div>
							</div>
						</Card>
						<Card>
							<div className='flex flex-col gap-6'>
								<div className='flex flex-col gap-2 border-b border-Gray-200 pb-4'>
									<p className='heading-md text-Gray-900'>
										VOC Measurements
									</p>
									<p className='body-lg-regular text-Gray-500'>
										VOC 검사 결과 입니다.
									</p>
								</div>
								<div className='flex flex-col gap-1'>
									<p className='text-Primary-700 body-lg-medium'>
										VOCs{' '}
										<span className='text-Gray-400 body-lg-regular'>
											(Volatile Organic Compounds)
										</span>
									</p>
									<BarChart
										safeStandard={'0-400'}
										warningStandard={'401-500'}
										dangerStandard={'>501'}
										maxValue={600}
										unit={'µg/m3'}
										data={vocData}
									/>
								</div>
							</div>
						</Card>
					</div>
				</div>
				<Card className='print-page-break'>
					<div className='flex flex-col gap-6'>
						<div className='flex flex-col gap-2 border-b border-Gray-200 pb-4'>
							<p className='heading-md text-Gray-900'>
								Air Quality Measurements
							</p>
							<p className='body-lg-regular text-Gray-500'>
								AQM 검사 결과 입니다.
							</p>
						</div>
						{aqmData.map((d) => (
							<div
								key={d.label}
								className='flex flex-col gap-1'>
								<p className='text-Primary-700 body-lg-medium'>
									{d.label}
								</p>
								<BarChart
									safeStandard={''} // 항목별 기준 다르면 여기서 분기 처리
									warningStandard={''}
									dangerStandard={
										aqmDangerStandards[d.label] ?? ''
									}
									maxValue={Math.ceil(d.value * 1.2)} // 평균값 기반으로 여유 잡기
									unit={detectUnit(d.label)} // 단위 표시
									data={[
										{
											label: d.label.split('(')[0],
											value: d.value,
										},
									]} // 🔑 한 항목 = 막대 1개
								/>
							</div>
						))}
					</div>
				</Card>
			</div>
			{toastMessage && (
				<ToastMessage
					status={toastMessage.status}
					message={toastMessage.message}
					setToastMessage={setToastMessage}
				/>
			)}
		</div>
	);
}

export default ManagementRecordDetailAqmPage;
