import { randomUUID, createHmac } from 'crypto';

import { formatDateTimeString } from '@/src/utils/date';
import { serviceNames, ServiceType } from '@/src/utils/supabase/companyServices';
import { ScheduleStatusType } from '@/src/utils/supabase/schedule';

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

const SOLAPI_ENDPOINT = 'https://api.solapi.com/v2/messages';

const templateCodeMap: Record<AlimtalkTemplateType, string | undefined> = {
        requested: process.env.SOLAPI_TEMPLATE_REQUESTED,
        confirmed: process.env.SOLAPI_TEMPLATE_CONFIRMED,
        cancelled: process.env.SOLAPI_TEMPLATE_CANCELLED,
};

function buildAuthorizationHeader(apiKey: string, apiSecret: string) {
        const date = new Date().toISOString();
        const salt = randomUUID();
        const signature = createHmac('sha256', apiSecret).update(date + salt).digest('base64');

        return `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`;
}

function sanitizePhones(phones: string[]): string[] {
        return phones
                .map((phone) => phone.replace(/[^0-9+]/g, ''))
                .filter((phone) => phone.length > 0);
}

export async function sendScheduleAlimtalk({
        type,
        schedule,
        kakaoPhones,
}: SendScheduleAlimtalkArgs) {
        const senderKey = process.env.SOLAPI_KAKAO_SENDER_KEY;
        if (!senderKey) {
                console.warn('[solapi] SOLAPI_KAKAO_SENDER_KEY is not configured. Skip sending.');
                return;
        }

        const templateCode = templateCodeMap[type];
        if (!templateCode) {
                console.warn(`[solapi] Template code is missing for type: ${type}.`);
                return;
        }

        const sanitizedPhones = sanitizePhones(kakaoPhones ?? []);
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

        const messages = sanitizedPhones.map((to) => {
                const variables = {
                        '#{companyName}': schedule.companyName ?? '',
                        '#{serviceName}': serviceNames[schedule.serviceType] ?? schedule.serviceType,
                        '#{date}': formatDateTimeString(schedule.scheduledAt),
                } as Record<string, string>;

                const message: Record<string, unknown> = {
                        to,
                        kakaoOptions: {
                                senderKey,
                                templateCode,
                                variables,
                        },
                };

                if (defaultSender) {
                        message.from = defaultSender;
                }

                return message;
        });

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
