// app/api/storage/remove/route.ts
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
	try {
		const { path, bucket } = await req.json();
		if (!path)
			return NextResponse.json({ error: 'path 누락' }, { status: 400 });

		const supabase = supabaseAdmin();
		const { error } = await supabase.storage
			.from(bucket || 'default')
			.remove([path]);
		if (error) throw error;

		return NextResponse.json({ ok: true });
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
}
