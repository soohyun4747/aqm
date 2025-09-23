export const SavingOverlay = () => {
	return (
		<div className='fixed inset-0 z-[9999] grid place-items-center bg-Gray-900/30 backdrop-blur-[1px]'>
			<div className='flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-lg'>
				<svg
					className='h-5 w-5 animate-spin'
					viewBox='0 0 24 24'
					fill='none'>
					<circle
						cx='12'
						cy='12'
						r='10'
						stroke='currentColor'
						strokeWidth='4'
						opacity='0.25'
					/>
					<path
						d='M22 12a10 10 0 0 0-10-10'
						stroke='currentColor'
						strokeWidth='4'
						strokeLinecap='round'
					/>
				</svg>
				<span className='text-Gray-900 body-md-medium'>저장 중…</span>
			</div>
		</div>
	);
};
