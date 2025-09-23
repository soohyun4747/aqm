export function sanitizeFileName(name: string) {
	// 경로문자 제거 및 공백/한글 등 간단 정리
	return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}