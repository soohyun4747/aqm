export function formatToHHMM(date: Date): string {
	return date.toLocaleTimeString('ko-KR', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	});
}
