// lib/schedules.client.ts
import { supabaseClient } from '@/lib/supabase/client';
import { monthRangeISO } from '../date';
import { ScheduleType } from '@/src/components/calendar/DateSection';
import { ISchedule } from '@/src/components/calendar/Shedule';

export async function fetchSchedulesByMonthClient(
	year: number,
	month1to12: number,
	opts?: { status?: ScheduleType; companyId?: string }
) {
	try {
		const { from, toExclusive } = monthRangeISO(year, month1to12);
		const supabase = supabaseClient();

		let query = supabase
			.from('schedules')
			.select('*', { count: 'exact' })
			.gte('date', from)
			.lt('date', toExclusive)
			.order('date', { ascending: true })
			.order('created_at', { ascending: true });

		if (opts?.status) query = query.eq('status', opts.status);
		if (opts?.companyId) query = query.eq('company_id', opts.companyId);

		const { data, error, count } = await query;
		if (error) throw error;

		return {
			rows: data ?? [],
			total: count ?? 0,
			range: { from, toExclusive },
		};
	} catch (error) {
		console.error(error);
		return {
			rows: [],
			total: 0,
		};
	}
}

export async function addNewSchedule(schedule: ISchedule) {
	try {
		const supabase = supabaseClient();

		// date -> 'YYYY-MM-DD'
		const toISODate = (d: string | Date) =>
			typeof d === 'string' ? d : new Date(d).toISOString().slice(0, 10);

		const payload = {
			company_id: schedule.companyId, // 회사 선택/연결된 값
			service_type: schedule.serviceType, // 'aqm' | 'hepa' | 'voc' | 'as'
			status: schedule.scheduleType, // 'requested' | 'confirmed'
			date: toISODate(schedule.date), // DATE 컬럼
			memo: schedule.memo ?? null, // 선택사항
		};

		return await supabase
			.from('schedules')
			.insert(payload)
			.select('id') // 필요하면 반환 컬럼 확장
			.single();
	} catch (error) {
		return { error };
	}
}
