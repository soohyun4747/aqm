// app/api/companies/new/route.ts
import { supabaseAdmin } from '@/lib/supabase/admin';
import { makePassword, sendAccountEmail } from '@/src/server/accountEmail';
import { ICompany } from '@/src/stores/userStore';
import { sanitizeFileName } from '@/src/utils/string';
import { NextResponse } from 'next/server';
import { defaultVocFilterType } from '@/src/constants/vocFilters';

export const runtime = 'nodejs'; // 파일 업로드 Buffer 사용을 위해 node 런타임
// export const dynamic = 'force-dynamic'; // (선택) 캐시 끄기

type HepaFilterDTO = {
	filterType: 'hepa' | 'pre' | 'preFrame';
	width: number | string;
	height: number | string;
	depth: number | string;
	quantity: number | string;
};

const FLOORPLANS_BUCKET = process.env.FLOORPLANS_BUCKET || 'floor-plans';

export async function POST(req: Request) {
	const admin = supabaseAdmin(); // service role 권한

	// ────────────────────────────────────────────────────────────────
	// 1) 요청 파싱 (JSON 또는 multipart/form-data 둘 다 지원)
	// ────────────────────────────────────────────────────────────────
	const contentType = req.headers.get('content-type') || '';
        let payload: {
                name: string;
                phone: string;
                email: string;
                address: string;
                kakaoPhones: string[];
                aqm: boolean;
                hepa: boolean;
        voc: boolean;
        vocQuantity: null | number;
        vocFilterType: string;
        hepaFilters: HepaFilterDTO[];
} = {
                name: '',
                phone: '',
                email: '',
                address: '',
                kakaoPhones: [],
                aqm: false,
                hepa: false,
        voc: false,
        vocQuantity: null,
        vocFilterType: '',
        hepaFilters: [],
};
	let floorPlanFile: File | null = null;

	try {
		if (contentType.includes('multipart/form-data')) {
			const form = await req.formData();

			// 문자열/숫자/불리언 필드
			payload.name = (form.get('name') as string) ?? '';
                        payload.phone = (form.get('phone') as string) ?? '';
                        payload.email = (form.get('email') as string) ?? '';
                        payload.address = (form.get('address') as string) ?? '';
                        const kakaoPhonesStr = (form.get('kakaoPhones') as string) || '[]';
                        payload.kakaoPhones = JSON.parse(kakaoPhonesStr) as string[];

                        // boolean 문자열을 boolean으로
                        payload.aqm = toBool(form.get('aqm'));
                        payload.hepa = toBool(form.get('hepa'));
                        payload.voc = toBool(form.get('voc'));

                        // 숫자
                        payload.vocQuantity = toNumber(form.get('vocQuantity'));
                        payload.vocFilterType = String(
                                form.get('vocFilterType') ?? ''
                        ).trim();

			// HEPA 필터들 (JSON 문자열로 받는 방식)
			const hepaFiltersStr = (form.get('hepaFilters') as string) || '[]';
			payload.hepaFilters = JSON.parse(hepaFiltersStr) as HepaFilterDTO[];

			// 파일 (선택)
			const file = form.get('floorPlanFile');
			floorPlanFile = file instanceof File ? file : null;
		} else {
			payload = await req.json();
			floorPlanFile = null; // JSON 경로에서는 파일 미지원(원하면 Base64 등으로 확장)
		}
        } catch (error: unknown) {
                if (error instanceof Error) {
                        console.error(error.message);
                        return NextResponse.json({ error: error.message }, { status: 400 });
                }
		console.error(error);
		return NextResponse.json(
			{ error: '알 수 없는 오류가 발생했습니다.' },
			{ status: 400 }
		);
        }

        payload.kakaoPhones = sanitizePhones(payload.kakaoPhones);

        const {
                name,
                phone,
                email,
                address,
                kakaoPhones,
                aqm,
                hepa,
                hepaFilters = [],
                voc,
                vocQuantity,
                vocFilterType,
        } = payload;

	// ────────────────────────────────────────────────────────────────
	// 2) 회사 레코드 생성
	// ────────────────────────────────────────────────────────────────
	let companyId: string | null = null;
	let floorImagePath: string | null = null;

	try {
                const { data: companyRow, error: cErr } = await admin
                        .from('companies')
                        .insert({
                                name,
                                phone: phone || null,
                                email: email || null,
                                address: address || null,
                                kakao_phones: (() => {
                                        const sanitized = sanitizePhones(kakaoPhones);
                                        return sanitized.length ? sanitized : null;
                                })(),
                                // floor_image_path는 업로드 후 update
                        })
			.select('id')
			.single();

		if (cErr) throw cErr;
		companyId = companyRow.id as string;
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error(error.message);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}
		console.error(error);
		return NextResponse.json(
			{ error: '알 수 없는 오류가 발생했습니다.' },
			{ status: 500 }
		);
	}

	// ────────────────────────────────────────────────────────────────
	// 3) 평면도 Storage 업로드 (선택)
	// ────────────────────────────────────────────────────────────────
	if (floorPlanFile && companyId) {
		try {
			const fileName = `${Date.now()}_${sanitizeFileName(floorPlanFile.name)}`;
			const path = `${companyId}/${fileName}`;

			// File -> ArrayBuffer -> Buffer
			const arrayBuffer = await floorPlanFile.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);
			const contentType =
				floorPlanFile.type || 'application/octet-stream';

			const { data: up, error: upErr } = await admin.storage
				.from(FLOORPLANS_BUCKET)
				.upload(path, buffer, {
					contentType,
					upsert: false,
				});

			if (upErr) throw upErr;

			floorImagePath = up?.path ?? path;

			const { error: updErr } = await admin
				.from('companies')
				.update({ floor_image_path: floorImagePath })
				.eq('id', companyId);
			if (updErr) throw updErr;
		} catch (error: unknown) {
			// 파일 업로드 실패 시, 회사 레코드 롤백
			await safeRollbackCompany(admin, companyId);
			if (error instanceof Error) {
				console.error(error.message);
				return NextResponse.json(
					{ error: error.message },
					{ status: 500 }
				);
			}
			console.error(error);
			return NextResponse.json(
				{ error: '알 수 없는 오류가 발생했습니다.' },
				{ status: 500 }
			);
		}
	}

	// ────────────────────────────────────────────────────────────────
	// 4) 서비스 생성
	// ────────────────────────────────────────────────────────────────
	try {
		if (aqm) {
			const { error } = await admin.from('company_services').insert({
				company_id: companyId,
				service_type: 'aqm',
			});
			if (error) throw error;
		}

		if (hepa) {
			const { data: hepaSvc, error: hepaErr } = await admin
				.from('company_services')
				.insert({ company_id: companyId, service_type: 'hepa' })
				.select('id')
				.single();
			if (hepaErr) throw hepaErr;

			const hepaServiceId = hepaSvc.id as string;

			if (Array.isArray(hepaFilters) && hepaFilters.length) {
				const payload = hepaFilters.map((f: HepaFilterDTO) => ({
					company_id: companyId!,
					company_service_id: hepaServiceId,
					filter_type:
						f.filterType === 'preFrame' ? 'pre' : f.filterType, // 'hepa' | 'pre'
					width: Number(f.width) || 0,
					height: Number(f.height) || 0,
					depth: Number(f.depth) || 0,
					quantity: Number(f.quantity) || 0,
				}));
				const { error: hErr } = await admin
					.from('hepa_filters')
					.insert(payload);
				if (hErr) throw hErr;
			}
		}

                if (voc) {
                        const { data: vocService, error: vocServiceErr } = await admin
                                .from('company_services')
                                .insert({
                                        company_id: companyId,
                                        service_type: 'voc',
                                })
                                .select('id')
                                .single();
                        if (vocServiceErr) throw vocServiceErr;

                        const { error: vocFilterErr } = await admin.from('voc_filters').insert({
                                company_id: companyId,
                                company_service_id: vocService.id,
                                filter_type: vocFilterType || defaultVocFilterType,
                                quantity: Number(vocQuantity) || 1,
                        });
                        if (vocFilterErr) throw vocFilterErr;
                }
	} catch (error: unknown) {
		await rollbackAll(admin, companyId, floorImagePath);
		if (error instanceof Error) {
			console.error(error.message);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}
		console.error(error);
		return NextResponse.json(
			{ error: '알 수 없는 오류가 발생했습니다.' },
			{ status: 500 }
		);
	}

	// ────────────────────────────────────────────────────────────────
	// 5) Auth 계정 생성
	//    - password: 로컬파트 + phone 마지막 4자리 (내부생성)
	//    - 실제 로그인은 recovery 링크로 유도(비번설정)
	// ────────────────────────────────────────────────────────────────
	let authUserId: string | null = null;
	const tempPassword = makePassword(email, phone);

	try {
		const { data: userCreate, error: userErr } =
			await admin.auth.admin.createUser({
				id: companyId!, // company와 user를 1:1로 묶고 싶을 때
				email,
				password: tempPassword,
				email_confirm: true,
				user_metadata: {
					company_id: companyId,
					created_by: 'saveNewCompany(api)',
				},
			});

		if (userErr) throw userErr;
		authUserId = userCreate.user?.id || null;

		if (authUserId) {
			const { error: pErr } = await admin.from('profiles').insert({
				user_id: authUserId,
				company_id: companyId,
				role: 'company',
			});
			if (pErr) throw pErr;
		}
	} catch (error: unknown) {
		await rollbackAll(admin, companyId, floorImagePath);
		if (error instanceof Error) {
			console.error(error.message);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}
		console.error(error);
		return NextResponse.json(
			{ error: '알 수 없는 오류가 발생했습니다.' },
			{ status: 500 }
		);
	}

	// ────────────────────────────────────────────────────────────────
	// 6) 비밀번호 설정 링크 생성 + 메일 발송
	// ────────────────────────────────────────────────────────────────
	const appLoginUrl = `${process.env.APP_BASE_URL}`;
	try {
		const { data: linkData, error: linkErr } =
			await admin.auth.admin.generateLink({
				type: 'recovery', // 최초 비밀번호 설정 유도
				email,
				options: {
					redirectTo: `${process.env.APP_BASE_URL}/resetPassword`,
				},
			});
		if (linkErr) throw linkErr;

		const resetUrl =
			(linkData as any)?.action_link ||
			(linkData as any)?.properties?.action_link;

		if (email && resetUrl) {
			await sendAccountEmail({
				to: email,
				companyName: name,
				loginUrl: appLoginUrl,
				resetUrl,
			});
		}
	} catch (e: unknown) {
		if (e instanceof Error) {
			console.error(e.message);
			return NextResponse.json({ error: e.message }, { status: 500 });
		}
		console.error(e);
		return NextResponse.json(
			{ error: '알 수 없는 오류가 발생했습니다.' },
			{ status: 500 }
		);
	}

	return NextResponse.json({
		ok: true,
		companyId,
		userId: authUserId,
	});
}

// ──────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────
function sanitizePhones(phones: unknown): string[] {
        if (!Array.isArray(phones)) return [];
        return phones
                .map((phone) => String(phone).trim())
                .filter((phone) => phone.length > 0);
}

function toBool(v: FormDataEntryValue | null): boolean {
        if (v === null) return false;
        const s = String(v).toLowerCase();
        return s === 'true' || s === '1' || s === 'on' || s === 'yes';
}
function toNumber(v: FormDataEntryValue | null): number | null {
	if (v === null || v === '') return null;
	const n = Number(v);
	return Number.isFinite(n) ? n : null;
}

async function safeRollbackCompany(admin: any, companyId: string | null) {
	if (!companyId) return;
	try {
		await admin.from('companies').delete().eq('id', companyId);
	} catch (_) {}
}

async function rollbackAll(
	admin: any,
	companyId: string | null,
	floorImagePath: string | null
) {
	if (!companyId) return;

	// 1) 업로드 파일 삭제
	if (floorImagePath) {
		try {
			await admin.storage
				.from(FLOORPLANS_BUCKET)
				.remove([floorImagePath]);
		} catch (_) {}
	}

        // 2) 부가 테이블 삭제
        try {
                await admin.from('voc_filters').delete().eq('company_id', companyId);
        } catch (_) {}
        try {
                await admin.from('hepa_filters').delete().eq('company_id', companyId);
        } catch (_) {}
	try {
		await admin
			.from('company_services')
			.delete()
			.eq('company_id', companyId);
	} catch (_) {}

	// 3) 회사 삭제
	try {
		await admin.from('companies').delete().eq('id', companyId);
	} catch (_) {}
}
