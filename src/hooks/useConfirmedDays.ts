// hooks/useConfirmedDays.ts
import { supabaseClient } from '@/lib/supabase/client';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import tz from 'dayjs/plugin/timezone';
import { useCallback, useEffect, useState } from 'react';
import { fetchSchedulesByMonth } from '../utils/supabase/schedule';

dayjs.extend(utc);
dayjs.extend(tz);

export function monthRangeKST(year: number, month0to11: number) {
	const y = String(year);
	const m = String(month0to11 + 1).padStart(2, '0');

	const start = dayjs.tz(
		`${y}-${m}-01 00:00:00`,
		'YYYY-MM-DD HH:mm:ss',
		'Asia/Seoul'
	);
	const end = start.add(1, 'month');

	return { from: start.toISOString(), toExclusive: end.toISOString() };
}

export function useConfirmedDays(companyId?: string) {
	const [ymdSet, setYmdSet] = useState<Set<string>>(new Set());
	const [yearMonth, setYearMonth] = useState<{ y: number; m: number }>(() => {
		const now = dayjs().tz('Asia/Seoul');
		return { y: now.year(), m: now.month() };
	});

	const reload = useCallback(
		async (y: number, m: number) => {

			const { rows } = await fetchSchedulesByMonth(y, m, {
				status: 'confirmed',
			});

			if (rows.length < 1) {
				setYmdSet(new Set());
				return;
			}
			const next = new Set<string>();
			for (const r of rows ?? []) {
				// KST 날짜단위로 막기
				const kst = dayjs(r.scheduledAt)
					.tz('Asia/Seoul')
					.startOf('day')
					.toDate();
				next.add(
					new Intl.DateTimeFormat('en-CA', {
						timeZone: 'Asia/Seoul',
						year: 'numeric',
						month: '2-digit',
						day: '2-digit',
					}).format(kst)
				);
			}
			setYmdSet(next);
		},
		[companyId]
	);

	// 초기/월 변경시 로드
	useEffect(() => {
		reload(yearMonth.y, yearMonth.m);
	}, [reload, yearMonth]);

	return {
		confirmedYmdSet: ymdSet,
		setMonth: (y: number, m: number) => setYearMonth({ y, m }),
	};
}
