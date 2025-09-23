// lib/schedules.client.ts
import { supabaseClient } from '@/lib/supabase/client';
import { monthRangeTimestamptz } from '../date';
import { ISchedule } from '@/src/components/calendar/Schedule';
import { ScheduleStatusType } from '@/src/components/calendar/DateSection';

export async function fetchSchedulesByMonth(
	year: number,
	month1to12: number,
	opts?: { status?: ScheduleStatusType; companyId?: string }
) {
	try {
		const { from, toExclusive } = monthRangeTimestamptz(year, month1to12);
		const supabase = supabaseClient();

		let query = supabase
			.from('schedules')
			.select('*', { count: 'exact' })
			.gte('scheduled_at', from)
			.lt('scheduled_at', toExclusive)
			.order('scheduled_at', { ascending: true })
			.order('created_at', { ascending: true });

		if (opts?.status) query = query.eq('status', opts.status);
		if (opts?.companyId) query = query.eq('company_id', opts.companyId);

		const { data, error, count } = await query;
		if (error) throw error;

		const dateFormatData: ISchedule[] = data.map((value) => ({
			companyId: value.company_id,
			status: value.status,
			serviceType: value.service_type,
			scheduledAt: new Date(value.scheduled_at),
			memo: value.memo,
			createdAt: new Date(value.created_at),
			updatedAt: new Date(value.updated_at),
		}));

		return {
			rows: dateFormatData ?? [],
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

export async function createSchedule(schedule: ISchedule) {
	try {
		const supabase = supabaseClient();

		const payload = {
			company_id: schedule.companyId, // 회사 선택/연결된 값
			service_type: schedule.serviceType, // 'aqm' | 'hepa' | 'voc' | 'as'
			status: schedule.status, // 'requested' | 'confirmed'
			scheduled_at: schedule.scheduledAt.toISOString(), // DATE 컬럼
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
