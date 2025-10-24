// client/storage.ts

export async function uploadFileToPath(file: File, path: string, bucket: string) {
	const form = new FormData();
	form.append('file', file);
	form.append('path', path);
	form.append('bucket', bucket);

	const res = await fetch('/api/storage/upload', {
		method: 'POST',
		body: form,
	});
	const json = await res.json();
	if (!res.ok) throw new Error(json.error);
	return json.path;
}

export async function removeFile(path: string, bucket: string) {
	const res = await fetch('/api/storage/remove', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ path, bucket }),
	});
	const json = await res.json();
	if (!res.ok) throw new Error(json.error);
}

export async function downloadFile(path: string, bucket: string): Promise<File> {
	const res = await fetch('/api/storage/download', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ path, bucket }),
	});
	if (!res.ok) {
		const err = await res.json();
		throw new Error(err.error || '다운로드 실패');
	}

	// 서버에서 받은 Blob 데이터
	const blob = await res.blob();

	// 파일 이름 추출
	const fileName = path.split('/').pop() || 'download';

	// File 객체 생성
	const file = new File([blob], fileName, {
		type: blob.type || 'application/octet-stream',
		lastModified: Date.now(),
	});

	return file;
}

