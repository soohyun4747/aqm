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

// ✅ DELETE /api/companies/:companyId
export async function DELETE(
	req: Request,
	context: { params: { companyId: string } }
) {
	const supabase = supabaseAdmin();
	const companyId = context.params.companyId;

	try {
		// 1️⃣ profiles에서 user_id 가져오기
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

		// 2️⃣ Supabase Auth 계정 삭제
		const { error: authErr } = await supabase.auth.admin.deleteUser(
			profile.user_id
		);
		if (authErr) throw authErr;

		// 2.5️⃣ Storage: floor-plans 버킷에서 해당 companyId 폴더 전부 삭제
		const BUCKET = 'floor-plans';
		// companyId 최상위 폴더(예: "abc123") 기준으로 재귀 수집
		const paths = await collectAllPaths(supabase, BUCKET, companyId);

		if (paths.length > 0) {
			const { error: removeErr } = await supabase.storage
				.from(BUCKET)
				.remove(paths);
			if (removeErr) throw removeErr;
		}
		// ⚠️ Supabase Storage는 "폴더" 자체를 지울 필요가 없습니다(접두어 개념).

		// 3️⃣ 관련 데이터 삭제 (순서 중요)
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

		// 4️⃣ 마지막으로 회사 삭제
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
		return NextResponse.json({ error: '알 수 없는 오류가 발생했습니다.' }, { status: 500 });
	}
}
