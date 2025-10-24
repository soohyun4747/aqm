// app/api/storage/download/route.ts
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
	try {
		const { path, bucket } = await req.json();
		if (!path) return NextResponse.json({ error: 'path 누락' }, { status: 400 });

		const supabase = supabaseAdmin();
		const { data, error } = await supabase.storage.from(bucket || 'default').download(path);
		if (error) throw error;

		const arrayBuffer = await data.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		const fileName = path.split('/').pop() || 'download.bin';

		return new NextResponse(buffer, {
			status: 200,
			headers: {
				'Content-Type': data.type || 'application/octet-stream',
				'Content-Disposition': `attachment; filename="${fileName}"`,
			},
		});
	} catch (err: any) {
		console.error(err);
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
