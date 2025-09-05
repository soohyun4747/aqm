// middleware.ts (프로젝트 루트)
import { NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: any) {
	const res = NextResponse.next();
	const supabase = createMiddlewareClient({ req, res });

	// 현재 세션 확인
	const {
		data: { session },
	} = await supabase.auth.getSession();

	// 로그인 안 되어 있으면 로그인 페이지로 리다이렉트
	if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
		return NextResponse.redirect(new URL('/login', req.url));
	}

	return res;
}
