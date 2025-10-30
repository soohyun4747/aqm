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
	month: number, // 0~11 (Jan=0)
	options: Options = {}
): Cell[][] {
	const weekStartsOn = options.weekStartsOn ?? 0; // 0: Sun, 1: Mon

	// ✔ 이번 달 일수
	const daysInMonth = new Date(year, month + 1, 0).getDate();

	const firstDay = new Date(year, month, 1); // 이번 달 1일
	const firstWeekdayRaw = firstDay.getDay(); // 0~6 (일~토)
	const firstWeekday = (firstWeekdayRaw - weekStartsOn + 7) % 7;

	// ✔ 이전 달 일수
	const prevMonthDays = new Date(year, month, 0).getDate();

	const totalCells = 42; // 6주 × 7일
	const cells: Cell[] = [];

	for (let i = 0; i < totalCells; i++) {
		const cellIndex = i - firstWeekday; // 이번 달 1일 기준 오프셋
		let cellDate: Date;
		let inCurrentMonth = true;

		if (cellIndex < 0) {
			// 이전 달
			const day = prevMonthDays + cellIndex + 1;
			cellDate = new Date(year, month - 1, day);
			inCurrentMonth = false;
		} else if (cellIndex >= daysInMonth) {
			// 다음 달
			const day = cellIndex - daysInMonth + 1;
			cellDate = new Date(year, month + 1, day);
			inCurrentMonth = false;
		} else {
			// 이번 달
			const day = cellIndex + 1;
			cellDate = new Date(year, month, day);
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

	// 7칸씩 6주 배열로 변환
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

export function monthRangeTimestamptz(year: number, month0to11: number) {
	const from = new Date(Date.UTC(year, month0to11, 1));
	const toExcl = new Date(Date.UTC(year, month0to11 + 1, 1)); // 다음달 1일
	const toISO = (d: Date) => d.toISOString(); // full ISO string (UTC)
	return { from: toISO(from), toExclusive: toISO(toExcl) };
}

/** JS Date -> YYYY-MM-DD (UTC 기준 잘라쓰기) */
export function toISODate(d: Date) {
	return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
		.toISOString()
		.slice(0, 10);
}

/** 날짜 → 'D일' 레이블 */
export function toDayLabel(d: Date) {
	return `${d.getDate()}일`;
}

/** string | Date → Date */
export function toDate(v: string | Date) {
	return v instanceof Date ? v : new Date(v);
}

export function toLocaleStringWithoutSec(date: Date) {
	return date.toLocaleString('ko-KR', {
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		// second: '2-digit' ← 이걸 안 넣으면 초는 표시 안 됩니다
	});
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function normalizeToMidnight(d: Date, useUTC = false) {
	const x = new Date(d);
	return useUTC
		? (x.setUTCHours(0, 0, 0, 0), x)
		: (x.setHours(0, 0, 0, 0), x);
}

/** 두 Date 사이의 '일수' 차이 (end - start) */
export function daysBetween(
	start: Date,
	end: Date,
	opts: { inclusive?: boolean; useUTC?: boolean } = {}
): number {
	const { inclusive = false, useUTC = false } = opts;
	const s = normalizeToMidnight(start, useUTC);
	const e = normalizeToMidnight(end, useUTC);

	let diff = Math.floor((e.getTime() - s.getTime()) / MS_PER_DAY);
	if (inclusive && diff >= 0) diff += 1; // 오늘 포함해서 세고 싶을 때
	return diff;
}

/** 특정 날짜로부터 '오늘'까지의 일수 */
export function daysSince(
	date: Date,
	opts: { inclusive?: boolean; useUTC?: boolean } = {}
): number {
	return daysBetween(date, new Date(), opts);
}

export function formatDateTimeString(datetimeStr: string): string {
	const date = new Date(datetimeStr); // 이미 KST로 변환됨
	const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000); // UTC+9

	const year = kst.getFullYear();
	const month = kst.getMonth() + 1;
	const day = kst.getDate();

	let hours = kst.getHours();
	const minutes = kst.getMinutes();

	const ampm = hours < 12 ? '오전' : '오후';
	if (hours > 12) hours -= 12;
	if (hours === 0) hours = 12;

	const formatted = `${year}년 ${month}월 ${day}일 ${ampm} ${hours}시 ${String(
		minutes
	).padStart(2, '0')}분`;

	return formatted;
}

// lib/date-utils.ts
export const fmtYMD = (d: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" })
    .format(d); // YYYY-MM-DD

export const isWeekend = (d: Date) => {
  const day = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "Asia/Seoul" }).format(d);
  return day === "Sat" || day === "Sun";
};

// 2025년 한국 공휴일(대체공휴 포함 주요일자) — 필요시 보강하세요.
export const KR_HOLIDAYS_2025 = new Set<string>([
  "2025-01-01", // 신정
  "2025-01-27", "2025-01-28", "2025-01-29", // 설연휴
  "2025-03-01", // 삼일절
  "2025-05-05", // 어린이날
  "2025-06-06", // 현충일
  "2025-08-15", // 광복절
  "2025-10-03", // 개천절
  "2025-10-05", "2025-10-06", // 추석 (예: 5~6일, 실제 연휴는 해마다 확인 필요)
  "2025-10-09", // 한글날
  "2025-12-25", // 성탄절
]);

export const isKRHoliday = (d: Date) => KR_HOLIDAYS_2025.has(fmtYMD(d));
