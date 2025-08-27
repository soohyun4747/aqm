import { handleFiles } from '@/utils/file';
import { useRef, useState } from 'react';

interface FileUploadProps {
	file?: File;
	availableTypes?: string[];
	onChangeFile?: (file: File | null) => void;
}

export function FileUpload(props: FileUploadProps) {
	const [error, setError] = useState<string | null>(null);

	const inputRef = useRef<HTMLInputElement>(null);

	// 허용 타입 배열 준비 (.csv, .xlsx 등)
	const acceptedTypes = props.availableTypes?.length
		? props.availableTypes
		: ['.csv', '.xlsx', '.xls'];

	const handleClick = () => {
		inputRef.current?.click();
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		props.onChangeFile &&
			handleFiles(
				e.target.files,
				setError,
				props.onChangeFile,
				acceptedTypes
			);
	};

	return (
		<div className='flex flex-col gap-2 self-stretch'>
			<p className='text-Gray-900 body-md-medium'>Upload file</p>
			<div className='flex w-[536px] self-stretch'>
				<div
					className='px-5 py-[10px] flex items-center justify-center rounded-l-[8px] border border-Gray-300 bg-Gray-800 cursor-pointer'
					onClick={handleClick}>
					<p className='text-white body-md-medium'>파일 선택</p>
					<input
						ref={inputRef}
						type='file'
						style={{ display: 'none' }}
						onChange={handleChange}
					/>
				</div>
				<div className='px-4 py-3 bg-Gray-50 border border-Gray-300 rounded-r-[8px] flex-1'>
					<p className='text-Gray-900 body-md-regular'>
						{props.file
							? props.file.name
							: '선택된 파일이 없습니다'}
					</p>
				</div>
			</div>
			{error && <p className='text-Red-600 body-sm-regular'>{error}</p>}
		</div>
	);
}
