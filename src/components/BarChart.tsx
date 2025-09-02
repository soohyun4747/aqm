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
	function getStandardWidth(standard: string, maxValue: number) {
		// standard can be "0-50", "51-100", "> 100"
		if (standard.startsWith('>')) {
			const min = parseFloat(standard.replace('>', '').trim());
			return ((maxValue - min) / maxValue) * 100;
		}
		const match = standard.match(/(\d+)\s*-\s*(\d+)/);
		if (match) {
			const min = parseFloat(match[1]);
			const max = parseFloat(match[2]);
			return ((max - min + 1) / maxValue) * 100;
		}
		return 0;
	}

	const safeStandardBgWidth = `calc((100% - 100px) * ${
		getStandardWidth(props.safeStandard, props.maxValue) / 100
	})`;

	const warningStandardBgWidth = `calc((100% - 100px) * ${
		getStandardWidth(props.warningStandard, props.maxValue) / 100
	})`;

	const dangerStandardBgWidth = `calc((100% - 100px) * ${
		getStandardWidth(props.dangerStandard, props.maxValue) / 100
	})`;

	return (
		<div className='flex flex-col gap-1'>
			<div className='flex'>
				<div className='min-w-[100px]' />
				<div className='flex w-full'>
					{props.safeStandard && (
						<div
							className='flex gap-[6px] p-2 items-center'
							style={{
								width: `${getStandardWidth(
									props.safeStandard,
									props.maxValue
								)}%`,
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
								width: `${getStandardWidth(
									props.warningStandard,
									props.maxValue
								)}%`,
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
								width: `${getStandardWidth(
									props.dangerStandard,
									props.maxValue
								)}%`,
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
					className='absolute bg-[#F9FAFB] h-full z-[-1] left-[100px] top-0'
				/>
				<div
					style={{
						width: warningStandardBgWidth,
						left: `calc(${safeStandardBgWidth} + 100px)`,
					}}
					className='absolute bg-[#F3F4F6] h-full z-[-1] top-0'
				/>
				<div
					style={{
						width: dangerStandardBgWidth,
						left: `calc(${safeStandardBgWidth} + ${warningStandardBgWidth} + 100px)`,
					}}
					className='absolute bg-[#E5E7EB] h-full z-[-1] top-0'
				/>
				{props.data.map((item, i) => (
					<div
						key={i}
						className='flex h-[30px]'>
						<div className='flex justify-end items-center w-[100px] pr-4'>
							<p className='text-Gray-900 text-right body-md-regular'>
								{item.label}
							</p>
						</div>
						<div className='flex flex-1 self-stretch border border-b-0 border-dashed border-Gray-200 items-center'>
							<div
								style={{
									width:
										(item.value / props.maxValue) * 100 +
										'%',
								}}
								className='h-[18px] flex items-center justify-center bg-Gray-500 rounded-r-[4px]'>
								<p className='text-Gray-50 text-[11px] font-400'>
									{item.value} {props.unit}
								</p>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
