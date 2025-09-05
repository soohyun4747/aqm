type Cell = {
	date: Date; // 실제 날짜 객체
	day: number; // 일(1~31)
	inCurrentMonth: boolean; // 이번 달 여부
	weekday: number; // 0=Sun ~ 6=Sat (옵션 반영 후)
};

type Options = {
	weekStartsOn?: 0 | 1; // 0=Sunday(기본), 1=Monday
};

export function getMonthGrid(
	year: number,
	month: number,
	options: Options = {}
): Cell[][] {
	const weekStartsOn = options.weekStartsOn ?? 0; // 0 or 1
	const daysInMonth = new Date(year, month, 0).getDate(); // 이번 달 일수 (month는 1~12)
	const firstDay = new Date(year, month - 1, 1); // 이번 달 1일
	const firstWeekdayRaw = firstDay.getDay(); // 0~6 (일~토)
	const firstWeekday = (firstWeekdayRaw - weekStartsOn + 7) % 7;

	// 이전 달 일수
	const prevMonthDays = new Date(year, month - 1, 0).getDate();

	// 총 42칸(6주 × 7일)
	const totalCells = 42;
	const cells: Cell[] = [];

	for (let i = 0; i < totalCells; i++) {
		const cellIndex = i - firstWeekday; // 이번 달 1일을 기준으로 한 오프셋
		let cellDate: Date;
		let inCurrentMonth = true;

		if (cellIndex < 0) {
			// 이전 달
			const day = prevMonthDays + cellIndex + 1;
			cellDate = new Date(year, month - 2, day);
			inCurrentMonth = false;
		} else if (cellIndex >= daysInMonth) {
			// 다음 달
			const day = cellIndex - daysInMonth + 1;
			cellDate = new Date(year, month, day);
			inCurrentMonth = false;
		} else {
			// 이번 달
			const day = cellIndex + 1;
			cellDate = new Date(year, month - 1, day);
		}

		const weekdayRaw = cellDate.getDay(); // 0~6 (일~토)
		const weekday = (weekdayRaw - weekStartsOn + 7) % 7;

		cells.push({
			date: cellDate,
			day: cellDate.getDate(),
			inCurrentMonth,
			weekday,
		});
	}

	// 7칸씩 끊어 6주 배열로 변환
	const weeks: Cell[][] = [];
	for (let w = 0; w < 6; w++) {
		weeks.push(cells.slice(w * 7, w * 7 + 7));
	}
	return weeks;
}

export function isToday(date: Date): boolean {
	const today = new Date();

	return (
		date.getFullYear() === today.getFullYear() &&
		date.getMonth() === today.getMonth() &&
		date.getDate() === today.getDate()
	);
}

export function formatDate(date: Date) {
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();
	return `${year}년 ${month.toString().padStart(2, '0')}월 ${day
		.toString()
		.padStart(2, '0')}일`;
}

export function formatTime(date: Date) {
	const hours = date.getHours();
	const minutes = date.getMinutes();

	//오후 2:00 이런 형식으로
	const period = hours >= 12 ? '오후' : '오전';
	const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
	const formattedMinutes = minutes.toString().padStart(2, '0');
	return `${period} ${formattedHours}:${formattedMinutes}`;
}

export function formatDateTime(date: Date) {
	//2025.01.01 오후 2:00와 같은 형식으로
	const year = date.getFullYear();
	const month = (date.getMonth() + 1).toString().padStart(2, '0');
	const day = date.getDate().toString().padStart(2, '0');
	const time = formatTime(date);
	return `${year}.${month}.${day} ${time}`;
}

export function areSameDate(date1: Date, date2: Date): boolean {
	return (
		date1.getFullYear() === date2.getFullYear() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getDate() === date2.getDate()
	);
}

export const today = new Date();
