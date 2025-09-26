import { supabaseClient } from '@/lib/supabase/client';

export const fetchHepaFiltersWithCompanyId = async (companyId: string) => {
	const supabase = supabaseClient();

	const { data, error } = await supabase
		.from('hepa_filters')
		.select('id, filter_type, width, height, depth, quantity, company_id')
		.eq('company_id', companyId)
		.order('filter_type', { ascending: true });
	if (error) throw error;

	return data;
};
