import { supabaseClient } from '@/lib/supabase/client';
import { PAGE_SIZE } from '@/src/components/datagrid/DataGrid';
import { ServiceType } from './companyServices';

export interface IManagementRecordRow {
	id: string;
	company_id: string;
	date: string;
	manager_name: string;
	service_type: string;
	created_at: string;
	updated_at: string;
	company_name: string;
	comment: string;
}

/**
 * 관리 기록 목록 조회
 * @param page 현재 페이지 (1부터 시작)
 * @param search 검색어 (optional)
 */
export async function fetchManagementRecords(page: number, search?: string) {
	const supabase = supabaseClient();
	const from = page * PAGE_SIZE; // 0-based 페이지
	const to = from + PAGE_SIZE - 1;

	let query = supabase
		.from('management_records_view')
		.select('*', { count: 'exact' })
		.order('date', { ascending: false })
		.range(from, to);

	if (search && search.trim() !== '') {
		const safe = search.trim().replace(/[\*\(\),]/g, '');
		// 이제 두 컬럼이 "한 뷰"에 있으므로 or()가 안정적으로 동작
		query = query.or(
			`manager_name.ilike.*${safe}*,company_name.ilike.*${safe}*`
		);
	}

	const { data, error, count } = await query;
	if (error) throw error;

	const rows = (data ?? []).map((row: any) => ({
		id: row.id,
		company_id: row.company_id,
		date: row.date,
		service_type: row.service_type,
		manager_name: row.manager_name,
		created_at: row.created_at,
		updated_at: row.updated_at,
		company_name: row.company_name,
		comment: row.comment
	}));

	return { rows, count: count ?? 0 };
}

/**
 * 관리 기록 삭제
 * @param id 삭제할 관리 기록 ID
 */
export async function deleteManagementRecord(id: string) {
	const supabase = supabaseClient();
	const { error } = await supabase
		.from('management_records')
		.delete()
		.eq('id', id);

	if (error) {
		console.error('Error deleting management record:', error);
		return false;
	}

	return true;
}

export const ManagementRecords_BUCKET = 'management-records';

/** 신규 저장 **/
export async function createManagementRecord(props: {
	companyId: string;
	date: Date;
	managerName: string;
	comment: string;
	serviceType: ServiceType; // 'AQM' 등
}): Promise<IManagementRecordRow> {
	const supabase = supabaseClient();
	const { data, error } = await supabase
		.from('management_records')
		.insert({
			company_id: props.companyId,
			date: props.date.toISOString(),
			manager_name: props.managerName,
			service_type: props.serviceType,
			comment: props.comment,
		})
		.select('*')
		.single();

	if (error) throw error;
	return data as IManagementRecordRow;
}

export async function fetchManagementRecordById(recordId: string) {
	const supabase = supabaseClient();
	const { data, error } = await supabase
		.from('management_records')
		.select('*')
		.eq('id', recordId)
		.single();
	if (error) throw error;
	return data as IManagementRecordRow;
}

export async function fetchManagementRecordsByCompany(
	companyId: string,
	page: number,
	search?: string
) {
	const supabase = supabaseClient();

	// 뷰/조인 구조에 맞게 테이블/뷰 이름 조정하세요.
	// 예시: management_records_view (company_name, manager_name, service_type 포함)
	let query = supabase
		.from('management_records_view')
		.select('*', { count: 'exact' })
		.eq('company_id', companyId);

	if (search && search.trim() !== '') {
		// manager_name, service_type, company_name 등 필요한 필드에 ilike
		// PostgREST or() 문법: .or('manager_name.ilike.%foo%,service_type.ilike.%foo%')
		const like = `%${search}%`;
		query = query.or(
			`manager_name.ilike.${like},service_type.ilike.${like},company_name.ilike.${like}`
		);
	}

	query = query
		.order('created_at', { ascending: false })
		.range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

	const { data, error, count } = await query;
	if (error) {
		console.error('fetchManagementRecordsByCompany error', error);
		throw error;
	}
	return { rows: data ?? [], count: count ?? 0 };
}

export async function updateManagementRecord(
	id: string,
	companyId: string,
	date: Date,
	managerName: string,
	comment: string,
	serviceType: ServiceType
) {
	const supabase = supabaseClient();

	const { error: updErr } = await supabase
		.from('management_records')
		.update({
			company_id: companyId,
			date: date.toISOString(),
			manager_name: managerName,
			service_type: serviceType,
			comment,
		})
		.eq('id', id);
	if (updErr) throw updErr;
}
