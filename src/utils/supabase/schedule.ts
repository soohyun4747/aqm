// lib/schedules.client.ts
import { supabaseClient } from '@/lib/supabase/client';
import { monthRangeTimestamptz } from '../date';
import { ISchedule } from '@/src/components/calendar/Schedule';
import { ScheduleStatusType } from '@/src/components/calendar/DateSection';

export async function fetchSchedulesByMonth(
	year: number,
	month0to11: number,
	opts?: { status?: ScheduleStatusType; companyId?: string }
) {
	try {
		const { from, toExclusive } = monthRangeTimestamptz(year, month0to11);
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
			id: value.id,
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

export async function updateSchedule(
	schedule: ISchedule
): Promise<ISchedule | null> {
	if (!schedule.id) {
		throw new Error('Schedule ID is required for update.');
	}

	const supabase = supabaseClient();

	// camelCase → snake_case 매핑
	const updates = {
		scheduled_at: schedule.scheduledAt.toISOString(),
		service_type: schedule.serviceType,
		status: schedule.status,
		memo: schedule.memo ?? null,
		company_id: schedule.companyId,
		updated_at: new Date().toISOString(),
	};

	const { data, error } = await supabase
		.from('schedules')
		.update(updates)
		.eq('id', schedule.id)
		.select()
		.single();

	if (error) {
		throw error;
	}

	// 반환 시 다시 camelCase로 매핑
	return {
		id: data.id,
		scheduledAt: new Date(data.scheduled_at),
		serviceType: data.service_type,
		status: data.status,
		memo: data.memo ?? undefined,
		companyId: data.company_id,
		createdAt: data.created_at ? new Date(data.created_at) : undefined,
		updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
	};
}

export async function deleteSchedule(id: string): Promise<boolean> {
	const supabase = supabaseClient();

	const { error } = await supabase.from('schedules').delete().eq('id', id);

	if (error) {
		console.error('Error deleting schedule:', error);
		throw error;
	}

	return true;
}
