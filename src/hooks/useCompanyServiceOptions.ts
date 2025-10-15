import { useEffect, useState } from 'react';
import { Option } from '@/src/components/Dropdown';
import { fetchCompanyServicesByCompanyId, serviceNames, Services, ServiceType } from '../utils/supabase/companyServices';

export function useCompanyServiceOptions(companyId?: string) {
	const [options, setOptions] = useState<Option[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<unknown>(null);

	useEffect(() => {
		let ignore = false;
		async function run() {
			if (!companyId) {
				setOptions([]);
				return;
			}
			setLoading(true);
			setError(null);
			try {
				const data = await fetchCompanyServicesByCompanyId(companyId);

				const unique = Array.from(
					new Set(
						(data ?? []).map(
							(r: { service_type: ServiceType }) => r.service_type
						)
					)
				);

				const opts = unique.map((v) => ({
					value: v,
					label: serviceNames[v] ?? v.toUpperCase(),
				}));

				opts.push({
					value: Services.as,
					label: serviceNames[Services.as],
				});

				if (!ignore) setOptions(opts);
			} catch (e) {
				if (!ignore) setError(e);
				console.error('Failed to load company services', e);
				if (!ignore) setOptions([]);
			} finally {
				if (!ignore) setLoading(false);
			}
		}
		run();
		return () => {
			ignore = true;
		};
	}, [companyId]);

	return { options, loading, error };
}
