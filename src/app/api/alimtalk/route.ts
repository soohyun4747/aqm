import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendScheduleAlimtalk } from '@/src/server/alimtalk';

const schema = z.object({
        type: z.enum(['requested', 'confirmed', 'cancelled']),
        agent: z.enum(['company', 'admin']),
        scheduleId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
        try {
                const { type, scheduleId } = schema.parse(await req.json());

                const supabase = supabaseAdmin();

                const { data, error }: any = await supabase
                        .from('schedules')
                        .select(
                                `
        id,
        company_id,
        status,
        service_type,
        scheduled_at,
        memo,
        companies:company_id ( name, kakao_phones )
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

                const kakaoPhones: string[] = Array.isArray(data.companies?.kakao_phones)
                        ? data.companies.kakao_phones.filter(
                                  (phone: unknown): phone is string =>
                                          typeof phone === 'string' && phone.trim().length > 0
                          )
                        : [];

                await sendScheduleAlimtalk({
                        type,
                        schedule: {
                                id: data.id,
                                companyId: data.company_id,
                                companyName: data.companies?.name ?? '',
                                status: data.status,
                                serviceType: data.service_type,
                                scheduledAt: data.scheduled_at,
                                memo: data.memo ?? null,
                        },
                        kakaoPhones,
                });

                return NextResponse.json({ ok: true });
        } catch (error: unknown) {
                if (error instanceof z.ZodError) {
                        return NextResponse.json({ error: error.message }, { status: 400 });
                }

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
