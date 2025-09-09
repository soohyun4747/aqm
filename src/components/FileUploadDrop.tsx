import { useEffect, useRef, useState } from 'react';
import { Button } from './buttons/Button';
import { Upload } from './icons/Upload';
import { handleFiles } from '@/src/utils/file';

interface FileUploadDropProps {
	file: File | null;
	availableTypes?: string[];
	onFileChange?: (file: File | null) => void;
}

export function FileUploadDrop(props: FileUploadDropProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [error, setError] = useState<string | null>(null);
	const [dragActive, setDragActive] = useState(false);

	// 허용 타입 배열 준비 (.csv, .xlsx 등)
	const acceptedTypes = props.availableTypes?.length
		? props.availableTypes
		: ['.csv', '.xlsx', '.xls'];	

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation(); // 크롬에서 파일 다운로드 방지
		setDragActive(false);
		props.onFileChange &&
			handleFiles(
				e.dataTransfer.files,
				setError,
				props.onFileChange,
				acceptedTypes
			);
	};

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = 'copy';
		console.log('over');
		setDragActive(true);
	};

	const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setDragActive(true);
	};

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);
	};

	const handleClick = () => {
		inputRef.current?.click();
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		props.onFileChange &&
			handleFiles(
				e.target.files,
				setError,
				props.onFileChange,
				acceptedTypes
			);
	};

	return (
		<div
			className={`flex  items-center justify-center self-stretch h-[180px] bg-Gray-50 border-2 border-dashed border-Gray-200 rounded-[8px] transition-colors ${
				dragActive ? 'bg-Gray-200' : ''
			} `}
			onDrop={handleDrop}
			onDragOver={handleDragOver}
			onDragEnter={handleDragEnter}
			onDragLeave={handleDragLeave}>
			<div className='flex flex-col gap-2 items-center'>
				<Upload fill='#9CA3AF' />
				<p className='text-Gray-500 body-md-regular'>
					{props.file
						? props.file.name
						: '파일을 여기로 드래그하세요.'}
				</p>
				<p className='text-Gray-500 body-sm-regular'>
					Max. File Size: 30MB
				</p>
				<Button
					variant='primary'
					onClick={handleClick}>
					파일 선택
				</Button>
				<input
					ref={inputRef}
					type='file'
					accept={acceptedTypes.join(',')}
					style={{ display: 'none' }}
					onChange={handleChange}
				/>
				{error && (
					<p className='text-Red-600 body-sm-regular'>{error}</p>
				)}
			</div>
		</div>
	);
}
