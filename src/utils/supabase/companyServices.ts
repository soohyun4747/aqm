import { supabaseClient } from '@/lib/supabase/client';

export const Services = {
	aqm: 'aqm',
	hepa: 'hepa',
	voc: 'voc',
	as: 'as',
} as const;


export const serviceNames: { [key: string]: string } = {
	aqm: 'AQM 검사',
	hepa: 'HEPA 필터 교체',
	voc: 'VOC 필터 교체',
	as: '장비 설치/AS',
};

export type ServiceType = (typeof Services)[keyof typeof Services];

export async function fetchCompanyServicesByCompanyId(
	companyId: string,
	serviceType?: ServiceType
) {
	const supabase = supabaseClient();

        let query = supabase
                .from('company_services')
                .select(
                        'id, company_id, service_type, voc_filters ( id, filter_type, quantity )'
                )
		.eq('company_id', companyId)
		.order('service_type', { ascending: true });

	if (serviceType) query = query.eq('service_type', serviceType);

	const { data, error } = await query;
	if (error) throw error;

	return data;
}