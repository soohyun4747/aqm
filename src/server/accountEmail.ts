import { EMAIL_FROM, resend } from '@/lib/resend';

export async function sendAccountEmail({
	to,
	companyName,
	loginUrl,
	resetUrl, // 비밀번호 설정 링크
}: {
	to: string;
	companyName: string;
	loginUrl: string;
	resetUrl: string;
}) {
	const subject = `[${companyName}] 계정 활성화 안내`;
	const html = `
  <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto; color:#0f172a; line-height:1.6;">
    <p>안녕하세요, ${companyName} 담당자님.</p>
    <p>AQM Square 서비스를 이용해주셔서 감사합니다.</p>
    <p>서비스 접속을 위해 아래 버튼을 눌러 <b>비밀번호를 설정</b>해 주세요.</p>
    <p style="margin:20px 0">
      <a href="${resetUrl}" style="padding:10px 16px; border-radius:8px; text-decoration:none; background:#4f46e5; color:#fff; display:inline-block;">비밀번호 설정하기</a>
    </p>
    <p>비밀번호 설정 이후에는 아래 로그인 페이지에서 이용하실 수 있습니다.</p>
    <p><a href="${loginUrl}">${loginUrl}</a></p>
    <hr style="margin:24px 0; border:none; border-top:1px solid #e2e8f0;"/>
    <p style="color:#475569;font-size:12px;line-height:1.5;">
      문의: <a href="mailto:cnc@ezivf.com" style="color:#475569;text-decoration:none;">cnc@ezivf.com</a><br/>
      전화: <a href="tel:+82312354310" style="color:#475569;text-decoration:none;">+82-31-235-4310</a><br/>
      홈페이지: <a href="https://cncbiotech.co.kr/" style="color:#475569;text-decoration:none;">https://cncbiotech.co.kr/</a>
    </p>
  </div>
`;

	await resend.emails.send({ from: EMAIL_FROM, to, subject, html });
}

// 비밀번호 규칙: 이메일 로컬파트 + 휴대폰 마지막 4자리(숫자만 추출)
export const makePassword = (email: string, phone: string) => {
	const local = (email.split('@')[0] || '').trim();
	const digits = (phone.match(/\d/g) || []).join('');
	const last4 = digits.slice(-4) || '000';
	// 최소 6자 보장(로컬파트가 너무 짧을 경우 대비)
	const pwd = `${local}${last4}`;
	return pwd.length >= 6 ? pwd : (pwd + '000000').slice(0, 6);
};
