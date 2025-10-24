// app/api/storage/upload/route.ts
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
	try {
		const form = await req.formData();
		const file = form.get('file');
		const path = form.get('path') as string;
		const bucket = (form.get('bucket') as string) || 'default';

		if (!(file instanceof File)) {
			return NextResponse.json({ error: 'file이 누락되었습니다.' }, { status: 400 });
		}
		if (!path) {
			return NextResponse.json({ error: 'path가 필요합니다.' }, { status: 400 });
		}

		const supabase = supabaseAdmin();
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
			upsert: false,
			cacheControl: '3600',
			contentType: file.type || 'application/octet-stream',
		});
		if (error) throw error;

		return NextResponse.json({ ok: true, path });
	} catch (err: any) {
		console.error(err);
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
