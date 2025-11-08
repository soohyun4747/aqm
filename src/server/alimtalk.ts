import { randomUUID, createHmac, randomBytes } from 'crypto';

import { formatDateTimeString } from '@/src/utils/date';
import {
        serviceNames,
        ServiceType,
} from '@/src/utils/supabase/companyServices';
import { ScheduleStatusType } from '@/src/utils/supabase/schedule';
import { fetchAdminNotificationContacts } from './adminContacts';

export type AlimtalkTemplateType = 'requested' | 'confirmed' | 'cancelled';

interface ScheduleForAlimtalk {
	id: string;
	companyId: string;
	companyName: string;
	serviceType: ServiceType;
	status: ScheduleStatusType;
	scheduledAt: string;
	memo?: string | null;
}

interface SendScheduleAlimtalkArgs {
	type: AlimtalkTemplateType;
	schedule: ScheduleForAlimtalk;
	kakaoPhones: string[];
}

const SOLAPI_ENDPOINT = 'https://api.solapi.com/messages/v4/send-many/detail';

const templateCodeMap: Record<AlimtalkTemplateType, string | undefined> = {
	requested: process.env.SOLAPI_TEMPLATE_REQUESTED,
	confirmed: process.env.SOLAPI_TEMPLATE_CONFIRMED,
	cancelled: process.env.SOLAPI_TEMPLATE_CANCELLED,
};

function buildAuthorizationHeader(apiKey: string, apiSecret: string) {
	// ✅ ISO8601 UTC (예: 2019-07-01T00:41:48Z)
	const date = new Date().toISOString();

	// ✅ 12~64바이트 임의 문자열 → hex 권장
	const salt = randomBytes(16).toString('hex');

	// ✅ HMAC-SHA256(date + salt) → "hex" (문서 예시 그대로)
	const signature = createHmac('sha256', apiSecret)
		.update(date + salt)
		.digest('hex'); // ← 바뀐 부분 (기존 base64 → hex)

	// ✅ 헤더 포맷 (대소문자/쉼표/공백 그대로)
	return `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`;
}

function sanitizePhones(phones: string[]): string[] {
        const seen = new Set<string>();
        const sanitized: string[] = [];

        for (const raw of phones) {
                const normalized = (raw ?? '').replace(/[^0-9+]/g, '');
                if (!normalized) continue;
                if (seen.has(normalized)) continue;

                seen.add(normalized);
                sanitized.push(normalized);
        }

        return sanitized;
}

export async function sendScheduleAlimtalk({
        type,
        schedule,
        kakaoPhones,
}: SendScheduleAlimtalkArgs) {
        const senderKey = process.env.SOLAPI_KAKAO_PFID;
        if (!senderKey) {
                console.warn(
                        '[solapi] SOLAPI_KAKAO_PFID is not configured. Skip sending.'
                );
		return;
	}

	const templateCode = templateCodeMap[type];
	if (!templateCode) {
		console.warn(`[solapi] Template code is missing for type: ${type}.`);
		return;
	}

        let adminPhones: string[] = [];
        try {
                const contacts = await fetchAdminNotificationContacts();
                adminPhones = contacts.phones;
        } catch (error) {
                console.error('Failed to load admin phone contacts', error);
        }

        const sanitizedPhones = sanitizePhones([...(kakaoPhones ?? []), ...adminPhones]);
        if (sanitizedPhones.length === 0) {
                console.warn('[solapi] No Kakao phone numbers provided.');
                return;
        }

	const apiKey = process.env.SOLAPI_API_KEY;
	const apiSecret = process.env.SOLAPI_API_SECRET;

	if (!apiKey || !apiSecret) {
		console.warn('[solapi] API credentials are not configured.');
		return;
	}

	const authorization = buildAuthorizationHeader(apiKey, apiSecret);
	const defaultSender = process.env.SOLAPI_DEFAULT_SENDER;

	const messages = sanitizedPhones.map((to) => ({
		to,
		kakaoOptions: {
			pfId: senderKey, // 채널 PFID
			templateId: templateCode, // 템플릿 ID
			variables: {
				'#{companyName}': schedule.companyName ?? '',
				'#{serviceName}':
					serviceNames[schedule.serviceType] ?? schedule.serviceType,
				'#{date}': formatDateTimeString(schedule.scheduledAt),
			},
		},
		...(defaultSender ? { from: defaultSender } : {}), // 대체문자 사용 시
	}));

	try {
		const response = await fetch(SOLAPI_ENDPOINT, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: authorization,
			},
			body: JSON.stringify({ messages }),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error(
				`[solapi] Failed to send Alimtalk (status: ${response.status}): ${errorText}`
			);
		}
	} catch (error) {
		console.error('[solapi] Network error while sending Alimtalk:', error);
	}
}
