import { getStandardPercents } from '../utils/chart';
import { CircleCheck } from './icons/CircleCheck';
import { CircleExclamation } from './icons/CircleExclamation';
import { CircleX } from './icons/CircleX';

interface BarChartProps {
	safeStandard: string; // e.g. "0-50"
	warningStandard: string; // e.g. "51-100"
	dangerStandard: string; // e.g. ">100"
	maxValue: number;
	unit: string;
	data: {
		label: string;
		value: number;
	}[];
}

export function BarChart(props: BarChartProps) {
	const { pSafe, pWarn, pDang } = getStandardPercents(
		props.safeStandard,
		props.warningStandard,
		props.dangerStandard,
		props.maxValue
	);

	const safeStandardBgWidth = `calc((100% - 100px) * ${pSafe / 100})`;
	const warningStandardBgWidth = `calc((100% - 100px) * ${pWarn / 100})`;
	const dangerStandardBgWidth = `calc((100% - 100px) * ${pDang / 100})`;

	return (
		<div className='flex flex-col gap-1'>
			<div className='flex'>
				<div className='min-w-[100px]' />
				<div className='flex w-full'>
					{props.safeStandard && (
						<div
							className='flex gap-[6px] p-2 items-center'
							style={{
								width: `calc(100% * ${pSafe / 100})`,
							}}>
							<CircleCheck
								fill='#0E9F6E'
								size={14}
							/>
							<p className='text-Gray-900 body-md-regular'>
								Safe{' '}
								{props.safeStandard
									? `(${props.safeStandard} ${props.unit})`
									: ''}
							</p>
						</div>
					)}
					{props.warningStandard && (
						<div
							className='flex gap-[6px] p-2 items-center'
							style={{
								width: `calc(100% * ${pWarn / 100})`,
							}}>
							<CircleExclamation
								fill='#E3A008'
								size={14}
							/>
							<p className='text-Gray-900 body-md-regular'>
								Warning{' '}
								{props.warningStandard
									? `(${props.warningStandard} ${props.unit})`
									: ''}
							</p>
						</div>
					)}
					{props.dangerStandard && (
						<div
							className='flex gap-[6px] p-2 items-center'
							style={{
								width: `calc(100% * ${pDang / 100})`,
							}}>
							<CircleX
								fill='#F05252'
								size={14}
							/>
							<p className='text-Gray-900 body-md-regular'>
								Danger{' '}
								{props.dangerStandard
									? `(${props.dangerStandard} ${props.unit})`
									: ''}
							</p>
						</div>
					)}
				</div>
			</div>
			<div className='flex flex-col relative'>
				<div
					style={{
						width: safeStandardBgWidth,
					}}
					className='absolute bg-Gray-50 h-full left-[100px] top-0'
				/>
				<div
					style={{
						width: warningStandardBgWidth,
						left: `calc(${safeStandardBgWidth} + 100px)`,
					}}
					className='absolute bg-Gray-100 h-full top-0'
				/>
				<div
					style={{
						width: dangerStandardBgWidth,
						left: `calc(${safeStandardBgWidth} + ${warningStandardBgWidth} + 100px)`,
					}}
					className='absolute bg-Gray-200 h-full top-0'
				/>
				{props.data.map((item, i) => (
					<div
						key={i}
						className='flex h-[30px] z-10'>
						<div className='flex justify-end items-center w-[100px] pr-4'>
							<p className='text-Gray-900 text-right body-md-regular'>
								{item.label}
							</p>
						</div>
						<div className='flex flex-1 self-stretch border border-dashed border-Gray-300 items-center gap-1'>
							<div
								style={{
									width:
										(item.value / props.maxValue) * 100 +
										'%',
								}}
								className='h-[18px] flex items-center justify-center rounded-r-[4px] chart-bar'></div>
							<p className='text-Gray-600 text-[11px] font-400'>
								{item.value} {props.unit}
							</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
