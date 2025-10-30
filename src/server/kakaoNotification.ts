import type { ScheduleMailType, IScheduleRoute } from './scheduleEmail';
import type { UserType } from '../stores/userStore';
import { formatDateTimeString } from '@/src/utils/date';
import { serviceNames } from '@/src/utils/supabase/companyServices';

interface SendScheduleKakaoNotificationsArgs {
        type: ScheduleMailType;
        subject: string;
        schedule: IScheduleRoute;
        agent: UserType;
        manageUrl: string;
        recipients: string[];
}

function sanitizeRecipients(recipients: string[]): string[] {
        const seen = new Set<string>();
        const normalized = recipients
                .map((raw) => raw.trim())
                .filter((raw) => raw.length > 0)
                .map((raw) => raw.replace(/[^0-9+]/g, ''))
                .filter((raw) => raw.length > 0);

        for (const phone of normalized) {
                if (!seen.has(phone)) {
                        seen.add(phone);
                }
        }

        return Array.from(seen);
}

export async function sendScheduleKakaoNotifications({
        type,
        subject,
        schedule,
        agent,
        manageUrl,
        recipients,
}: SendScheduleKakaoNotificationsArgs) {
        const phones = sanitizeRecipients(recipients);
        if (phones.length === 0) return;

        const endpoint = process.env.KAKAO_NOTIFICATION_ENDPOINT;
        if (!endpoint) {
                console.warn('KAKAO_NOTIFICATION_ENDPOINT is not configured. Skip Kakao alerts.');
                return;
        }

        const body = {
                to: phones,
                subject,
                message: buildMessage({ type, schedule, agent, manageUrl }),
                metadata: {
                        scheduleId: schedule.id,
                        companyId: schedule.companyId,
                        status: schedule.status,
                        type,
                        agent,
                },
        };

        const headers: Record<string, string> = {
                'Content-Type': 'application/json',
        };

        const token = process.env.KAKAO_NOTIFICATION_API_KEY || process.env.KAKAO_NOTIFICATION_TOKEN;
        if (token) {
                headers.Authorization = `Bearer ${token}`;
        }

        try {
                const response = await fetch(endpoint, {
                        method: 'POST',
                        headers,
                        body: JSON.stringify(body),
                });

                if (!response.ok) {
                        const errorText = await response.text();
                        console.error('Failed to send Kakao notification', {
                                status: response.status,
                                statusText: response.statusText,
                                errorText,
                        });
                }
        } catch (error) {
                console.error('Unexpected error while sending Kakao notification', error);
        }
}

function buildMessage({
        type,
        schedule,
        agent,
        manageUrl,
}: {
        type: ScheduleMailType;
        schedule: IScheduleRoute;
        agent: UserType;
        manageUrl: string;
}) {
        const companyName = schedule.companyName ?? '';
        const lines = [
                `${companyName ? `[${companyName}] ` : ''}${subjectLabel(type)}`,
                `주체: ${agent === 'company' ? '고객' : '관리자'}`,
                `서비스: ${serviceNames[schedule.serviceType] ?? schedule.serviceType}`,
                `일정: ${formatDateTimeString(schedule.scheduledAt)}`,
        ];

        if (schedule.memo) {
                lines.push(`메모: ${schedule.memo}`);
        }

        if (manageUrl) {
                lines.push(`자세한 내용: ${manageUrl}`);
        }

        return lines.join('\n');
}

function subjectLabel(type: ScheduleMailType) {
        switch (type) {
                case 'requested':
                        return '스케줄이 요청되었습니다';
                case 'confirmed':
                        return '스케줄이 확정되었습니다';
                case 'cancelled':
                        return '스케줄이 취소되었습니다';
                default:
                        return '';
        }
}
