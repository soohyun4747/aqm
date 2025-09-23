import { supabaseClient } from '@/lib/supabase/client';
import { PAGE_SIZE } from '@/src/components/datagrid/DataGrid';
import { Option } from '@/src/components/Dropdown';
import { IHepaFilter } from '@/src/pages/admin/companies/edit';
import { fileNameFromPath } from '../file';
import { ICompany } from '@/src/stores/userStore';
import { sanitizeFileName } from '../string';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { removeFile } from './storage';

const floorPlans_BUCKET = 'floor-plans';

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

// 비밀번호 규칙: 이메일 로컬파트 + 휴대폰 마지막 3자리(숫자만 추출)
const makePassword = (email: string, phone: string) => {
	const local = (email.split('@')[0] || '').trim();
	const digits = (phone.match(/\d/g) || []).join('');
	const last3 = digits.slice(-3) || '000';
	// 최소 6자 보장(로컬파트가 너무 짧을 경우 대비)
	const pwd = `${local}${last3}`;
	return pwd.length >= 6 ? pwd : (pwd + '000000').slice(0, 6);
};

export const saveNewCompany = async (
	floorPlanFile: File | null,
	name: string,
	phone: string,
	email: string,
	address: string,
	aqm: boolean,
	hepa: boolean,
	hepaFilters: IHepaFilter[],
	voc: boolean,
	vocQuantity: number
) => {
	const supabase = supabaseClient();

	// (1) 회사 레코드 먼저 생성 (파일 경로 없이)
	const { data: companyRow, error: cErr } = await supabase
		.from('companies')
		.insert({
			name,
			phone: phone || null,
			email: email || null,
			address: address || null,
			// floor_image_path는 파일 업로드 이후에 update로 채움
		})
		.select('id')
		.single();
	if (cErr) throw cErr;

	const companyId = companyRow.id as string;

	// (2) 평면도 Storage 업로드 (선택) — 회사 폴더 경로로 업로드 (RLS 통과)
	let floorImagePath: string | null = null;
	if (floorPlanFile) {
		const fileName = `${Date.now()}_${sanitizeFileName(
			floorPlanFile.name
		)}`;
		const path = `${companyId}/${fileName}`; // 회사별 폴더
		const { data: up, error: upErr } = await supabase.storage
			.from(floorPlans_BUCKET)
			.upload(path, floorPlanFile, { upsert: false });

		if (upErr) throw upErr;

		floorImagePath = up?.path ?? path;

		const { error: updErr } = await supabase
			.from('companies')
			.update({ floor_image_path: floorImagePath })
			.eq('id', companyId);
		if (updErr) throw updErr;
	}

	// (3) 서비스 생성 (체크된 것만)
	if (aqm) {
		const { error } = await supabase.from('company_services').insert({
			company_id: companyId,
			service_type: 'aqm',
		});
		if (error) throw error;
	}

	if (hepa) {
		const { data: hepaSvc, error: hepaErr } = await supabase
			.from('company_services')
			.insert({
				company_id: companyId,
				service_type: 'hepa',
			})
			.select('id')
			.single();
		if (hepaErr) throw hepaErr;

		const hepaServiceId = hepaSvc.id as string;

		if (hepaFilters.length) {
			const payload = hepaFilters.map((f) => ({
				company_id: companyId,
				company_service_id: hepaServiceId,
				filter_type: f.filterType === 'preFrame' ? 'pre' : f.filterType, // 'hepa' | 'pre'
				width: Number(f.width) || 0,
				height: Number(f.height) || 0,
				depth: Number(f.depth) || 0,
				quantity: Number(f.quantity) || 0,
			}));
			const { error: hErr } = await supabase
				.from('hepa_filters')
				.insert(payload);
			if (hErr) throw hErr;
		}
	}

	if (voc) {
		const { error } = await supabase.from('company_services').insert({
			company_id: companyId,
			service_type: 'voc',
			quantity: vocQuantity || null,
		});
		if (error) throw error;
	}

	// (4) Auth 계정 생성 (Admin API)
	//    - email: 전달받은 email
	//    - password: 로컬파트 + phone 마지막 3자리
	const admin = supabaseAdmin();
	const password = makePassword(email, phone);

	const { data: userCreate, error: userErr } =
		await admin.auth.admin.createUser({
			id: companyId,
			email,
			password,
			email_confirm: true,
			user_metadata: {
				company_id: companyId,
				created_by: 'saveNewCompany',
			},
		});

	if (userErr) {
		console.error('Auth user 생성 실패:', userErr.message);

		// (1) 업로드한 평면도 이미지 제거
		if (floorImagePath) {
			try {
				await supabase.storage
					.from(floorPlans_BUCKET)
					.remove([floorImagePath]);
			} catch (rmErr) {
				console.warn('floor plan 삭제 실패:', rmErr);
			}
		}

		// (2) hepa_filters 삭제 (company_id 기준)
		try {
			await supabase
				.from('hepa_filters')
				.delete()
				.eq('company_id', companyId);
		} catch (rmErr) {
			console.warn('hepa_filters 삭제 실패:', rmErr);
		}

		// (3) company_services 삭제 (company_id 기준)
		try {
			await supabase
				.from('company_services')
				.delete()
				.eq('company_id', companyId);
		} catch (rmErr) {
			console.warn('company_services 삭제 실패:', rmErr);
		}

		// (4) companies 삭제 (최종)
		try {
			await supabase.from('companies').delete().eq('id', companyId);
		} catch (rmErr) {
			console.warn('companies 삭제 실패:', rmErr);
		}

		// 실패 원인을 다시 throw 해서 상위 로직에 알림
		throw userErr;
	}

	const authUserId = userCreate.user?.id;

	// (선택) profiles 테이블에 사용자 프로필 생성 (요구사항/스키마에 맞게 조정)
	if (authUserId) {
		// role 기본값이 있다면 생략 가능. 관리자가 아니면 'user' 등으로 저장.
		const { error: pErr } = await admin.from('profiles').insert({
			user_id: authUserId, // PK
			company_id: companyId,
			role: 'company', // 필요 시 'admin' 지정 가능
		});
		// 프로필 생성 실패는 굳이 전체 롤백하지 않고 경고로 처리할 수도 있음
		if (pErr) {
			console.warn('profiles insert failed:', pErr.message);
		}
	}
};

export const updateCompany = async (
	company: ICompany,
	floorPlanFile: File | null,
	name: string,
	phone: string,
	email: string,
	address: string,
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
	const supabase = supabaseAdmin();

	// 1. profiles에서 user_id 가져오기
	const { data: profile } = await supabase
		.from('profiles')
		.select('user_id')
		.eq('company_id', companyId)
		.single();

	if (!profile) throw new Error('Profile not found');

	// 2. Supabase Auth 계정 삭제 (Admin API)
	const { error } = await supabase.auth.admin.deleteUser(profile.user_id);
	if (error) throw error;

	// 3. company 관련 데이터들 삭제
	await supabase.from('profiles').delete().eq('company_id', companyId);
	await supabase
		.from('company_services')
		.delete()
		.eq('company_id', companyId);
	await supabase.from('hepa_filters').delete().eq('company_id', companyId);
	await supabase.from('schedules').delete().eq('company_id', companyId);

	// 4. 마지막으로 회사 삭제
	await supabase.from('companies').delete().eq('id', companyId);
}

export async function fetchCompanyInfobyId(id: string) {
	const supabase = supabaseClient();
	const { data, error } = await supabase
		.from('companies')
		.select('*')
		.eq('id', id)
		.single(); // id는 PK라서 하나만 반환

	if (error) {
		console.error('❌ fetchCompanyInfobyId error:', error.message);
		throw error;
	}

	return data; // 없으면 null
}
