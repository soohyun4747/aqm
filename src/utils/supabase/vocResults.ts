import { supabaseClient } from '@/lib/supabase/client';

export interface IVOCResultRow {
	id?: string;
	company_id: string;
	management_record_id: string;
	confirm: boolean;
}

export async function fetchVocResultsByRecordId(recordId: string) {
	const supabase = supabaseClient();

	const { data, error } = await supabase
		.from('voc_results')
		.select('id, company_id, management_record_id, filter_id, confirm')
		.eq('management_record_id', recordId);

	if (error) throw error;

	return data;
}

export async function createVocResults(rows: IVOCResultRow[]) {
	const supabase = supabaseClient();
	const { error: hepaErr } = await supabase.from('voc_results').insert(rows);
	if (hepaErr) throw hepaErr;
}

export async function updateVocResults(rows: IVOCResultRow[]) {
	if (!rows || rows.length === 0) return;

	const supabase = supabaseClient();

	// id가 없는 행은 업데이트 대상에서 제외
	const targets = rows.filter((r) => !!r.id);
	if (targets.length === 0) return;

	// 동시에 너무 많이 날리지 않도록 청크 처리
	const CHUNK = 40;
	for (let i = 0; i < targets.length; i += CHUNK) {
		const chunk = targets.slice(i, i + CHUNK);

		const tasks = chunk.map((r) => {
			const updatePayload: any = {
				confirm: r.confirm,
				// 필요 시 아래 주석 해제 (스키마/정책상 안전한 경우에만)
				// company_id: r.companyId,
			};
			if (r.management_record_id) {
				updatePayload.management_record_id = r.management_record_id;
			}
			return supabase
				.from('voc_results')
				.update(updatePayload)
				.eq('id', r.id as string);
		});

		const settled = await Promise.allSettled(tasks);
		const errors = settled
			.filter((s: any) => s.status === 'fulfilled' && s.value?.error)
			.map((s: any) => s.value.error)
			.concat(
				settled
					.filter(
						(s): s is PromiseRejectedResult =>
							s.status === 'rejected'
					)
					.map((s) => s.reason)
			);

		if (errors.length > 0) {
			// 첫 번째 에러를 던지거나 AggregateError로 묶어서 던져도 됩니다.
			throw errors[0];
		}
	}
}
