import { supabaseClient } from '@/lib/supabase/client';
import { VocFilterType } from '@/src/constants/vocFilters';

export interface IVocFilterRow {
        id: string;
        company_id: string;
        company_service_id: string;
        filter_type: VocFilterType;
        quantity: number;
}

export async function fetchVocFiltersByCompanyId(companyId: string) {
        const supabase = supabaseClient();

        const { data, error } = await supabase
                .from('voc_filters')
                .select('id, company_id, company_service_id, filter_type, quantity')
                .eq('company_id', companyId);

        if (error) throw error;

        return (data ?? []) as IVocFilterRow[];
}

export async function fetchVocFilterByCompanyServiceId(serviceId: string) {
        const supabase = supabaseClient();

        const { data, error } = await supabase
                .from('voc_filters')
                .select('id, company_id, company_service_id, filter_type, quantity')
                .eq('company_service_id', serviceId);

        if (error) throw error;

        return (data ?? []) as IVocFilterRow[];
}
