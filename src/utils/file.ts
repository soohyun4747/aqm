import { SetStateAction } from 'react';

const MAX_SIZE = 30 * 1024 * 1024; // 30MB

export const handleFiles = (
	files: FileList | null,
	setError: (value: SetStateAction<string | null>) => void,
	onFileChange: (file: File | null) => void,
	acceptedTypes: string[]
) => {
	if (!files || files.length === 0) return;
	const file = files[0];
	if (file.size > MAX_SIZE) {
		setError('파일 용량은 최대 30MB까지 가능합니다.');
		onFileChange(null);
		return;
	}
	// 확장자 검사
	const isAccepted = acceptedTypes.some(
		(type) =>
			file.name.endsWith(type.replace(/^\./, '')) ||
			file.name.endsWith(type)
	);
	if (!isAccepted) {
		setError(`${acceptedTypes.join(', ')} 파일만 업로드 가능합니다.`);
		onFileChange(null);
		return;
	}
	setError(null);
	onFileChange(file);
};
