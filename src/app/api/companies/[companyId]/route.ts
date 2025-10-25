import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

async function collectAllPaths(
	supabase: ReturnType<typeof supabaseAdmin>,
	bucket: string,
	prefix: string
): Promise<string[]> {
	// 재귀적으로 prefix 이하의 모든 파일 경로를 수집
	const paths: string[] = [];
	const pageSize = 100;

	async function walk(path: string) {
		let offset = 0;

		while (true) {
			const { data, error } = await supabase.storage
				.from(bucket)
				.list(path, {
					limit: pageSize,
					offset,
					sortBy: { column: 'name', order: 'asc' },
				});

			if (error) throw error;
			if (!data || data.length === 0) break;

			for (const entry of data) {
				const child = path ? `${path}/${entry.name}` : entry.name;
				// 파일인지 폴더인지 구분을 위해 하위 목록을 시도
				const { data: probe, error: probeErr } = await supabase.storage
					.from(bucket)
					.list(child, { limit: 1 });

				// 하위가 없거나 에러면 "파일"로 간주
				if (probeErr || !probe || probe.length === 0) {
					paths.push(child);
				} else {
					// 폴더이므로 더 내려감
					await walk(child);
				}
			}

			if (data.length < pageSize) break;
			offset += pageSize;
		}
	}

	await walk(prefix);
	return paths;
}

type RouteContext = {
	params: Record<string, string | string[]>;
};

// ✅ DELETE /api/companies/:companyId
export async function DELETE(req: Request, context: RouteContext) {
	// companyId는 string | string[] 가능성이 있으므로 안전하게 문자열로 변환
	const companyIdParam = context.params.companyId;
	const companyId = Array.isArray(companyIdParam)
		? companyIdParam[0]
		: companyIdParam;

	if (!companyId) {
		return NextResponse.json(
			{ error: 'Invalid companyId' },
			{ status: 400 }
		);
	}

	const supabase = supabaseAdmin();

	try {
		// 1) profiles에서 user_id 가져오기
		const { data: profile, error: profileErr } = await supabase
			.from('profiles')
			.select('user_id')
			.eq('company_id', companyId)
			.single();

		if (profileErr || !profile) {
			return NextResponse.json(
				{ error: 'Profile not found' },
				{ status: 404 }
			);
		}

		// 2) Supabase Auth 계정 삭제
		const { error: authErr } = await supabase.auth.admin.deleteUser(
			profile.user_id
		);
		if (authErr) throw authErr;

		// 2.5) Storage 삭제 (필요시)
		const BUCKET = 'floor-plans';
		const paths = await collectAllPaths(supabase, BUCKET, companyId);
		if (paths.length > 0) {
			const { error: removeErr } = await supabase.storage
				.from(BUCKET)
				.remove(paths);
			if (removeErr) throw removeErr;
		}

		// 3) 관련 데이터 삭제
		await supabase.from('profiles').delete().eq('company_id', companyId);
		await supabase
			.from('company_services')
			.delete()
			.eq('company_id', companyId);
		await supabase
			.from('hepa_filters')
			.delete()
			.eq('company_id', companyId);
		await supabase.from('schedules').delete().eq('company_id', companyId);

		// 4) 회사 삭제
		await supabase.from('companies').delete().eq('id', companyId);

		return NextResponse.json(
			{
				success: true,
				message:
					'Company, related data, and floor-plans storage objects deleted.',
			},
			{ status: 200 }
		);
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
}
