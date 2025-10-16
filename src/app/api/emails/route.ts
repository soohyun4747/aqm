import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendScheduleEmails } from '@/src/server/scheduleEmail';

const schema = z.object({
	type: z.enum(['requested', 'confirmed', 'cancelled']),
	agent: z.enum(['company', 'admin']),
	scheduleId: z.uuid(),
});

export async function POST(req: NextRequest) {
	try {
		const { type, scheduleId, agent } = schema.parse(await req.json());
		const supabase = supabaseAdmin();

		// ✅ 서버가 DB에서 신뢰 가능한 데이터 재조회 (회사 이메일/이름 포함)

		const { data, error }: any = await supabase
			.from('schedules')
			.select(
				`
        id, company_id, status, service_type, scheduled_at, memo,
        companies:company_id ( name, email )
      `
			)
			.eq('id', scheduleId)
			.single();

		if (error || !data) {
			return NextResponse.json(
				{ error: 'Schedule not found' },
				{ status: 404 }
			);
		}

		await sendScheduleEmails({
			type: type,
			agent: agent,
			schedule: {
				id: data.id,
				companyId: data.company_id,
				companyName: data.companies.name,
				status: data.status,
				serviceType: data.service_type,
				scheduledAt: data.scheduled_at,
				memo: data.memo ?? null,
			},
			companyEmail: data.companies.email, // 고객 메일로 사용
		});

		return NextResponse.json({ ok: true });
	} catch (e: any) {
		return NextResponse.json(
			{ error: e?.message || 'Unknown error' },
			{ status: 500 }
		);
	}
}
