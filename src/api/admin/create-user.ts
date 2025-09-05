// app/api/admin/create-company-user/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  const { companyName, email, password } = await req.json();

  // service_role 키로 서버 클라이언트 생성 (서버 환경변수!)
  const admin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // 절대 클라이언트에 노출 금지
  );

  // 1) 회사 조회/생성
  let { data: company } = await admin.from('companies')
    .select('id,name').eq('name', companyName).single();

  if (!company) {
    const { data: created, error: cErr } = await admin.from('companies')
      .insert({ name: companyName }).select('id,name').single();
    if (cErr) return NextResponse.json({ error: cErr.message }, { status: 400 });
    company = created!;
  }

  // 2) 유저 생성 (관리자 권한 API)
  const { data: userRes, error: uErr } = await admin.auth.admin.createUser({
    email,
    password, // 또는 email_confirm: true, invite 등 정책에 따라
    email_confirm: true, // 관리자가 신뢰하고 생성하는 흐름이라면 true 권장
  });
  if (uErr) return NextResponse.json({ error: uErr.message }, { status: 400 });

  // 3) 프로필 연결 (role=company, company_id 지정)
  const userId = userRes.user?.id;
  if (!userId) return NextResponse.json({ error: 'No user id' }, { status: 400 });

  const { error: pErr } = await admin.from('profiles').upsert({
    user_id: userId,
    role: 'company',
    company_id: company.id,
  });
  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 400 });

  return NextResponse.json({ ok: true, company, userId });
}
