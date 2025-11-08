import { resend, EMAIL_FROM } from '@/lib/resend';
import CustomerScheduleEmail, {
} from '@/src/emails/CustomerScheduleEmail';
import AdminScheduleEmail from '@/src/emails/AdminScheduleEmail';
import { render } from '@react-email/components';
import { ServiceType } from '../utils/supabase/companyServices';
import { ScheduleStatusType } from '../utils/supabase/schedule';
import { UserType } from '../stores/userStore';
import { fetchAdminNotificationContacts } from './adminContacts';

export type ScheduleMailType =
	| 'requested'
	| 'confirmed'
	// | 'edited'
	| 'cancelled';

export interface IScheduleRoute {
	id?: string;
	scheduledAt: string;
	serviceType: ServiceType;
	status: ScheduleStatusType;
	memo?: string;
	companyId: string;
	companyName?: string;
	delayedLabel?: string;
}

export interface ScheduleEmailProps {
	type: ScheduleMailType;
	agent: UserType;
	schedule: IScheduleRoute;
	manageUrl: string;
}

export const scheduleSubjectMap = {
	requested: '스케줄이 요청되었습니다',
	confirmed: '스케줄이 확정되었습니다',
	// edited: '스케줄이 수정되었습니다',
	cancelled: '스케줄이 취소되었습니다',
} as const;


export async function sendScheduleEmails(args: {
	type: ScheduleMailType;
	agent: UserType;
	schedule: IScheduleRoute;
	companyEmail: string;
}) {
	const { type, schedule, companyEmail, agent } = args;

	const manageUrl = `${process.env.APP_BASE_URL}/schedules/${schedule.id}`;

	// 고객용
	const customerHtml = await render(
		<CustomerScheduleEmail
			type={type}
			agent={agent}
			schedule={schedule}
			manageUrl={manageUrl}
		/>
	);

	await resend.emails.send({
		from: EMAIL_FROM,
		to: companyEmail,
		subject: scheduleSubjectMap[type],
		html: customerHtml,
	});

        let adminEmails: string[] = [];
        try {
                const contacts = await fetchAdminNotificationContacts();
                adminEmails = contacts.emails;
        } catch (error) {
                console.error('Failed to load admin email contacts', error);
        }

        // 관리자용
        if (adminEmails.length > 0) {
                const adminHtml = await render(
                        <AdminScheduleEmail
                                type={type}
                                agent={agent}
                                schedule={schedule}
                                manageUrl={manageUrl}
                        />
                );

                await resend.emails.send({
                        from: EMAIL_FROM,
                        to: adminEmails,
                        subject: scheduleSubjectMap[type],
                        html: adminHtml,
                });
        }
}
