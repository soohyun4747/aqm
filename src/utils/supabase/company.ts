import { supabaseClient } from '@/lib/supabase/client';
import { PAGE_SIZE } from '@/src/components/datagrid/DataGrid';
import { Option } from '@/src/components/Dropdown';
import { IHepaFilter } from '@/src/pages/admin/companies/edit/[id]';
import { fileNameFromPath } from '../file';
import { ICompany } from '@/src/stores/userStore';
import { sanitizeFileName } from '../string';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { removeFile } from './storage';

const floorPlans_BUCKET = 'floor-plans';

const sanitizePhones = (phones: string[] = []) =>
        phones.map((phone) => phone.trim()).filter((phone) => phone.length > 0);

export async function fetchCompanyWithCompanyId(companyId: string) {
	try {
		const supabase = supabaseClient();

		const { data: c, error: cErr } = await supabase
			.from('companies')
			.select(
				'id, name, phone, email, address, floor_image_path, kakao_phones'
			)
			.eq('id', companyId)
			.single();

		if (cErr) {
			console.error('회사 데이터 로딩 실패:', cErr.message);
		} else if (c) {
                        const company: ICompany = {
                                id: c.id,
                                name: c.name,
                                phone: c.phone ?? '',
                                email: c.email ?? '',
                                address: c.address ?? '',
                                floorImagePath: c.floor_image_path ?? undefined,
                                kakaoPhones: Array.isArray(c.kakao_phones)
                                        ? c.kakao_phones
                                        : [],
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

		// 공통 쿼리 빌더 (필터 재사용을 위해 함수로 분리)
		const base = () =>
			supabase
				.from('companies')
				.select(
					'id, name, email, phone, address, floor_image_path, kakao_phones',
					{
						count: 'exact',
					}
				);

		// --- 1) count 전용 HEAD 요청 (동일한 필터 적용) ---
		let countQuery = base();

		if (search.trim()) {
			countQuery = countQuery.or(
				`name.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%`
			);
		}

		// head:true 로 데이터는 받지 않고 count만
		const { count, error: countErr } = await countQuery
			.order('created_at', { ascending: false }) // 정렬은 count에는 영향 없지만 동일성 유지
			.limit(1) // 일부 호스팅에서 HEAD 최적화가 없을 수 있어 최소 limit
			.maybeSingle(); // payload 최소화

		if (countErr) throw countErr;

		// 총 개수가 0이거나, 현재 page의 시작 인덱스가 개수 이상이면 빈 결과 반환
		if (!count || from >= count) {
			return { rows: [], count: count ?? 0 };
		}

		// --- 2) 실제 페이지 데이터 조회 ---
		let dataQuery = base()
			.order('created_at', { ascending: false })
			.range(from, Math.min(to, count - 1)); // 상한 클램핑

		if (search.trim()) {
			dataQuery = dataQuery.or(
				`name.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%`
			);
		}

		const { data, error } = await dataQuery;
		if (error) throw error;

		return { rows: data ?? [], count: count ?? 0 };
	} catch (e) {
		console.error('회사 목록 로딩 실패:', e);
		// 416 방어: 서버가 이미 에러를 던져도 UI가 무너지지 않게 빈 결과 반환
		return { rows: [], count: 0 };
	}
};

export const loadCompanyDetails = async (
	companyId: string,
	floorImagePath?: string | null
) => {
	const supabase = supabaseClient();

	// (1) 평면도 파일 다운로드
	let floorPlanFile: File | null = null;
	if (floorImagePath) {
		const { data: blob, error: dErr } = await supabase.storage
			.from(floorPlans_BUCKET) // 버킷 이름
			.download(floorImagePath);

		if (!dErr && blob) {
			floorPlanFile = new File([blob], fileNameFromPath(floorImagePath), {
				type: blob.type || 'application/octet-stream',
			});
		}
	}

	// (2) 서비스 목록 조회
	const { data: services, error: sErr } = await supabase
		.from('company_services')
		.select('id, service_type, quantity')
		.eq('company_id', companyId);
	if (sErr) throw sErr;

	const hasAqm = (services ?? []).some((s) => s.service_type === 'aqm');
	const hasHepa = (services ?? []).some((s) => s.service_type === 'hepa');
	const vocRow = (services ?? []).find((s) => s.service_type === 'voc');

	// (3) HEPA 필터 목록 조회
	let hepaFilters: IHepaFilter[] = [
		{ filterType: 'hepa', width: 0, height: 0, depth: 0, quantity: 1 },
	];
	if (hasHepa) {
		const { data: filters, error: fErr } = await supabase
			.from('hepa_filters')
			.select('filter_type, width, height, depth, quantity')
			.eq('company_id', companyId)
			.order('id', { ascending: true });
		if (fErr) throw fErr;

		if (filters?.length) {
			hepaFilters = filters.map((f: any) => ({
				filterType: f.filter_type === 'hepa' ? 'hepa' : 'pre', // 필요 시 preFrame 구분 로직 추가
				width: Number(f.width) || 0,
				height: Number(f.height) || 0,
				depth: Number(f.depth) || 0,
				quantity: Number(f.quantity) || 0,
			}));
		}
	}

	return {
		floorPlanFile,
		aqm: hasAqm,
		hepa: hasHepa,
		voc: !!vocRow,
		vocQuantity: vocRow?.quantity ?? 0,
		hepaFilters,
	};
};

export const saveNewCompany = async (
        floorPlanFile: File | null,
        name: string,
        phone: string,
        email: string,
        address: string,
        kakaoPhones: string[],
        aqm: boolean,
        hepa: boolean,
        hepaFilters: IHepaFilter[],
        voc: boolean,
        vocQuantity: number
) => {
        const fd = new FormData();
        if (floorPlanFile) fd.append('floorPlanFile', floorPlanFile);
        fd.append('name', name);
        fd.append('phone', phone);
        fd.append('email', email);
        fd.append('address', address);
        const sanitizedPhones = sanitizePhones(kakaoPhones);
        fd.append('kakaoPhones', JSON.stringify(sanitizedPhones));
        fd.append('aqm', String(aqm));
        fd.append('hepa', String(hepa));
        fd.append('voc', String(voc));
        fd.append('vocQuantity', String(vocQuantity ?? ''));
        fd.append('hepaFilters', JSON.stringify(hepaFilters));

	const res = await fetch('/api/companies/new', {
		method: 'POST',
		body: fd,
	});

	const json = await res.json();
	if (!res.ok) throw new Error(json.error || 'Failed to create company');
	return json;
};

export const updateCompany = async (
        company: ICompany,
        floorPlanFile: File | null,
        name: string,
        phone: string,
        email: string,
        address: string,
        kakaoPhones: string[],
        aqm: boolean,
        voc: boolean,
        vocQuantity: number,
        hepa: boolean,
        hepaFilters: IHepaFilter[]
) => {
        const supabase = supabaseClient();

	// (1) floor plan 업로드
	let floorImagePath = null;

	// 기존 파일이 있는 경우 → 기존 파일 삭제
	if (company.floorImagePath) {
		await removeFile(company.floorImagePath, floorPlans_BUCKET);
	}

	if (floorPlanFile) {
		const fileName = sanitizeFileName(floorPlanFile.name);
		const path = `${company.id}/${fileName}`;

		// 새 파일 업로드
		const { data: up, error: upErr } = await supabase.storage
			.from(floorPlans_BUCKET)
			.upload(path, floorPlanFile, { upsert: false });

		if (upErr) throw upErr;
		floorImagePath = up?.path ?? null;
	}

	// (2) 회사 정보 업데이트
        const { error: updateErr } = await supabase
                .from('companies')
                .update({
                        name,
                        phone,
                        email,
                        address,
                        kakao_phones: (() => {
                                const sanitized = sanitizePhones(kakaoPhones);
                                return sanitized.length ? sanitized : null;
                        })(),
                        floor_image_path: floorImagePath,
                })
                .eq('id', company.id);

        if (updateErr) throw updateErr;

	// (3) 기존 서비스 목록 가져오기
	const { data: services, error: sErr } = await supabase
		.from('company_services')
		.select('id, service_type')
		.eq('company_id', company.id);
	if (sErr) throw sErr;

	const existing = {
		aqm: services?.some((s) => s.service_type === 'aqm') ?? false,
		voc: services?.some((s) => s.service_type === 'voc') ?? false,
		hepa: services?.some((s) => s.service_type === 'hepa') ?? false,
	};

	// (4) 서비스 상태 비교 → 삽입/삭제
	// AQM
	if (!existing.aqm && aqm) {
		await supabase.from('company_services').insert({
			company_id: company.id,
			service_type: 'aqm',
		});
	} else if (existing.aqm && !aqm) {
		await supabase
			.from('company_services')
			.delete()
			.eq('company_id', company.id)
			.eq('service_type', 'aqm');
	}

	// VOC
	if (!existing.voc && voc) {
		await supabase.from('company_services').insert({
			company_id: company.id,
			service_type: 'voc',
			default_quantity: vocQuantity || null,
		});
	} else if (existing.voc && voc) {
		await supabase
			.from('company_services')
			.update({ default_quantity: vocQuantity || null })
			.eq('company_id', company.id)
			.eq('service_type', 'voc');
	} else if (existing.voc && !voc) {
		await supabase
			.from('company_services')
			.delete()
			.eq('company_id', company.id)
			.eq('service_type', 'voc');
	}

	// HEPA
	if (!existing.hepa && hepa) {
		const { data: newService, error: insertErr } = await supabase
			.from('company_services')
			.insert({
				company_id: company.id,
				service_type: 'hepa',
			})
			.select('id')
			.single();
		if (insertErr) throw insertErr;

		// 새로 추가한 경우 → 필터 데이터 insert
		const hepaServiceId = newService.id;
		if (hepaFilters.length) {
			const payload = hepaFilters.map((f) => ({
				company_id: company.id,
				company_service_id: hepaServiceId,
				filter_type: f.filterType === 'preFrame' ? 'pre' : f.filterType,
				width: Number(f.width) || 0,
				height: Number(f.height) || 0,
				depth: Number(f.depth) || 0,
				quantity: Number(f.quantity) || 0,
			}));
			await supabase.from('hepa_filters').insert(payload);
		}
	} else if (existing.hepa && hepa) {
		// 이미 존재 → 기존 필터 삭제 후 새로 insert (수정 겸용)
		await supabase
			.from('hepa_filters')
			.delete()
			.eq('company_id', company.id);

		const { data: hepaService } = await supabase
			.from('company_services')
			.select('id')
			.eq('company_id', company.id)
			.eq('service_type', 'hepa')
			.single();

		if (hepaService && hepaFilters.length) {
			const payload = hepaFilters.map((f) => ({
				company_id: company.id,
				company_service_id: hepaService.id,
				filter_type: f.filterType === 'preFrame' ? 'pre' : f.filterType,
				width: Number(f.width) || 0,
				height: Number(f.height) || 0,
				depth: Number(f.depth) || 0,
				quantity: Number(f.quantity) || 0,
			}));
			await supabase.from('hepa_filters').insert(payload);
		}
	} else if (existing.hepa && !hepa) {
		// hepa 해제 → 서비스 & 필터 전부 삭제
		await supabase
			.from('hepa_filters')
			.delete()
			.eq('company_id', company.id);
		await supabase
			.from('company_services')
			.delete()
			.eq('company_id', company.id)
			.eq('service_type', 'hepa');
	}
};

export async function deleteCompany(companyId: string) {
	await fetch(`/api/companies/${companyId}`, {
		method: 'DELETE',
	});
}

export async function fetchCompanyInfobyId(id: string): Promise<ICompany> {
        const supabase = supabaseClient();
        const { data, error } = await supabase
                .from('companies')
                .select(
                        'id, name, email, phone, address, floor_image_path, kakao_phones'
                )
                .eq('id', id)
                .single(); // id는 PK라서 하나만 반환

        if (error) {
                console.error('❌ fetchCompanyInfobyId error:', error.message);
                throw error;
        }

        return {
                id: data.id,
                name: data.name ?? '',
                email: data.email ?? '',
                phone: data.phone ?? '',
                address: data.address ?? '',
                floorImagePath: data.floor_image_path ?? undefined,
                kakaoPhones: Array.isArray(data.kakao_phones)
                        ? data.kakao_phones
                        : [],
        };
}

export const updateCompanyKakaoPhones = async (
        companyId: string,
        kakaoPhones: string[]
) => {
        const supabase = supabaseClient();
        const sanitized = sanitizePhones(kakaoPhones);

        const { error } = await supabase
                .from('companies')
                .update({ kakao_phones: sanitized.length ? sanitized : null })
                .eq('id', companyId);

        if (error) throw error;

        return sanitized;
};
