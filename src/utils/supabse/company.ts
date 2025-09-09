import { supabaseClient } from '@/lib/supabase/client';
import { PAGE_SIZE } from '@/src/components/datagrid/DataGrid';
import { Option } from '@/src/components/Dropdown';

export async function fetchCompanyWithCompanyId(companyId: string) {
	try {
		const supabase = supabaseClient();

		const { data: c, error: cErr } = await supabase
			.from('companies')
			.select('id, name, phone, email, address, floor_image_path')
			.eq('id', companyId)
			.single();

		if (cErr) {
			console.error('회사 데이터 로딩 실패:', cErr.message);
		} else if (c) {
			const company = {
				id: c.id,
				name: c.name,
				phone: c.phone ?? undefined,
				email: c.email ?? undefined,
				address: c.address ?? undefined,
				floorImagePath: c.floor_image_path ?? undefined,
			};

			return company;
		}
	} catch (error) {
		console.error(error);
	}
}

export async function fetchCompanyOptions(keyword?: string): Promise<Option[]> {
	const defaultOption = { label: '고객 선택', value: '' };
	try {
		const supabase = supabaseClient();

		let query = supabase
			.from('companies')
			.select('id, name')
			.order('name', { ascending: true });

		if (keyword && keyword.trim()) {
			query = query.ilike('name', `%${keyword.trim()}%`);
		}

		const { data, error } = await query;
		if (error) throw error;
		const options = (data ?? []).map((c) => ({
			value: c.id,
			label: c.name,
		}));
		options.unshift(defaultOption);

		return options;
	} catch (error) {
		console.error(error);
		return [defaultOption];
	}
}

export const fetchCompanies = async (page: number, search: string) => {
	try {
		const supabase = supabaseClient();

		const from = page * PAGE_SIZE;
		const to = from + PAGE_SIZE - 1;

		let query = supabase
			.from('companies')
			.select('id, name, email, phone, address, floor_image_path', {
				count: 'exact',
			})
			.order('created_at', { ascending: false })
			.range(from, to);

		if (search.trim()) {
			// 이름/이메일 간단 검색 (원하면 phone/address로 확장)
			query = query.or(
				`name.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%`
			);
		}

		const { data, error, count } = await query;
		if (error) throw error;

		return { rows: data, count };
	} catch (e) {
		console.error('회사 목록 로딩 실패:', e);
	}
};
