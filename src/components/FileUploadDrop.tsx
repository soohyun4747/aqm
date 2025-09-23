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
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);

	// 허용 타입 확장 (이미지 미리보기 가능하도록)
	const acceptedTypes = props.availableTypes?.length
		? props.availableTypes
		: ['.csv', '.xlsx', '.xls', '.png', '.jpg', '.jpeg', '.webp'];

	// file 변경 시 미리보기 URL 갱신
	useEffect(() => {
		if (props.file) {
			const isImage = props.file.type.startsWith('image/');
			if (isImage) {
				const url = URL.createObjectURL(props.file);
				setPreviewUrl(url);
				return () => URL.revokeObjectURL(url);
			}
		}
		setPreviewUrl(null);
	}, [props.file]);

	const onDropCommon = (files: FileList | null) => {
		props.onFileChange &&
			handleFiles(files, setError, props.onFileChange, acceptedTypes);
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);
		onDropCommon(e.dataTransfer.files);
	};

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = 'copy';
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

	const handleClick = () => inputRef.current?.click();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onDropCommon(e.target.files);
		// 같은 파일을 다시 선택해도 change 이벤트가 뜨도록 value 초기화
		e.currentTarget.value = '';
	};

	const clearFile = () => {
		setError(null);
		props.onFileChange?.(null);
	};

	return (
		<div
			className={`
        relative self-stretch border-2 border-dashed border-Gray-200 rounded-[8px]
        transition-colors overflow-hidden
        ${previewUrl ? '' : 'bg-Gray-50'}
        ${dragActive ? 'ring-2 ring-Primary-500 ring-offset-2' : ''}
      `}
			onDrop={handleDrop}
			onDragOver={handleDragOver}
			onDragEnter={handleDragEnter}
			onDragLeave={handleDragLeave}
			role='button'
			tabIndex={0}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') handleClick();
			}}>
			{/* 파일 있을 때 */}
			{props.file ? (
				previewUrl ? (
					// 이미지 파일일 경우 → 미리보기
					<div className='relative'>
						<img
							src={previewUrl}
							alt={props.file?.name ?? 'preview'}
							className='w-full h-auto object-contain block'
							draggable={false}
							onClick={handleClick}
						/>

						{/* 상단 그라데이션 + 파일명/버튼 오버레이 */}
						<div className='pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/50 to-transparent' />
						<div className='absolute inset-x-0 top-0 flex items-center justify-between gap-2 px-3 py-2'>
							<p className='truncate max-w-[70%] text-white body-sm-regular'>
								{props.file?.name}
							</p>
							<div className='flex gap-2'>
								<Button
									variant='alternative'
									onClick={handleClick}
									className='pointer-events-auto px-3 py-1'>
									변경
								</Button>
								<Button
									variant='danger'
									onClick={clearFile}
									className='pointer-events-auto px-3 py-1'>
									삭제
								</Button>
							</div>
						</div>
					</div>
				) : (
					// 이미지가 아닌 파일일 경우 → 파일명만 표시
					<div className='flex h-[180px] items-center justify-center px-4'>
						<div className='flex flex-col gap-2 items-center text-center'>
							<p className='text-Gray-900 body-md-regular'>
								{props.file.name}
							</p>
							<div className='flex gap-2'>
								<Button
									variant='alternative'
									onClick={handleClick}
									className='px-3 py-1'>
									변경
								</Button>
								<Button
									variant='danger'
									onClick={clearFile}
									className='px-3 py-1'>
									삭제
								</Button>
							</div>
						</div>
					</div>
				)
			) : (
				// 파일 없을 때
				<div className='flex h-[180px] items-center justify-center'>
					<div className='flex flex-col gap-2 items-center'>
						<Upload fill='#9CA3AF' />
						<p className='text-Gray-500 body-md-regular'>
							파일을 여기로 드래그하세요.
						</p>
						<p className='text-Gray-500 body-sm-regular'>
							Max. File Size: 30MB
						</p>
						<Button
							variant='primary'
							onClick={handleClick}>
							파일 선택
						</Button>
					</div>
				</div>
			)}

			{/* 숨김 파일 입력 */}
			<input
				ref={inputRef}
				type='file'
				accept={acceptedTypes.join(',')}
				className='hidden'
				onChange={handleChange}
			/>

			{/* 에러 메시지 */}
			{error && (
				<p className='mt-2 text-Red-600 body-sm-regular'>{error}</p>
			)}
		</div>
	);
}
