import { supabaseClient } from '@/lib/supabase/client';
import { ServiceType } from '@/src/pages/admin/companies/edit';

export async function fetchCompanyServicesByCompanyId(
	companyId: string,
	serviceType?: ServiceType
) {
	const supabase = supabaseClient();

	let query = supabase
		.from('company_services')
		.select('id, company_id, service_type, quantity')
		.eq('company_id', companyId)
		.order('service_type', { ascending: true });

	if (serviceType) query = query.eq('service_type', serviceType);

	const { data, error } = await query;
	if (error) throw error;

	return data;
}
