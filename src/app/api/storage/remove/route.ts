// app/api/storage/remove/route.ts
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
	try {
		const { path, bucket } = await req.json();
		if (!path) return NextResponse.json({ error: 'path 누락' }, { status: 400 });

		const supabase = supabaseAdmin();
		const { error } = await supabase.storage.from(bucket || 'default').remove([path]);
		if (error) throw error;

		return NextResponse.json({ ok: true });
	} catch (err: any) {
		console.error(err);
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
