import { supabaseClient } from '@/lib/supabase/client';
import { IHEPAResult } from '@/src/pages/admin/managementRecords/edit/hepa';

export interface IHEPAResultRow {
	id?: string;
	company_id: string;
	filter_id: string;
	confirm: boolean;
}

export async function createHepaResults(rows: IHEPAResultRow[]) {
	const supabase = supabaseClient();
	const { error: hepaErr } = await supabase.from('hepa_results').insert(rows);
	if (hepaErr) throw hepaErr;
}

export async function updateHepaResultsViaRpc(rows: IHEPAResultRow[]) {
	if (!rows || rows.length === 0) return;
	const supabase = supabaseClient();

	// RPC에 넘길 payload는 DB 컬럼명(snake_case)으로 맞추세요.
	const payload = rows.filter((r) => !!r.id);

	const { error } = await supabase.rpc('hepa_results_bulk_update', {
		_rows: payload as any, // Supabase가 jsonb로 직렬화
	});

	if (error) throw error;
}

export async function fetchHepaResultsByRecordId(recordId: string) {
	const supabase = supabaseClient();

	const { data, error } = await supabase
		.from('hepa_results')
		.select('id, company_id, management_record_id, filter_id, confirm')
		.eq('management_record_id', recordId);

	if (error) throw error;

	return data;
}
