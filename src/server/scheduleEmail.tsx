import { resend, EMAIL_FROM, ADMIN_EMAILS } from '@/lib/resend';
import CustomerScheduleEmail, {
	ScheduleMailType,
	scheduleSubjectMap,
} from '@/src/emails/CustomerScheduleEmail';
import AdminScheduleEmail from '@/src/emails/AdminScheduleEmail';
import { render } from '@react-email/components';
import { ServiceType } from '../utils/supabase/companyServices';
import { ScheduleStatusType } from '../utils/supabase/schedule';

interface ISchedule {
	id?: string;
	scheduledAt: Date;
	serviceType: ServiceType;
	status: ScheduleStatusType;
	memo?: string;
	companyId: string;
	companyName?: string;
	delayedLabel?: string;
	createdAt?: Date;
	updatedAt?: Date;
}

export async function sendScheduleEmails(args: {
	type: ScheduleMailType;
	schedule: ISchedule;
	companyEmail: string;
}) {
	const { type, schedule, companyEmail } = args;

	const manageUrl = `${process.env.APP_BASE_URL}/schedules/${schedule.id}`;

	// 고객용
	const customerHtml = await render(
		<CustomerScheduleEmail
			type={type}
			schedule={schedule}
			manageUrl={manageUrl}
		/>
	);

	console.log({ EMAIL_FROM, companyEmail });

	await resend.emails.send({
		from: EMAIL_FROM,
		to: companyEmail,
		subject: scheduleSubjectMap[type],
		html: customerHtml,
	});

	// 관리자용
	if (ADMIN_EMAILS.length > 0) {
		const adminHtml = await render(
			<AdminScheduleEmail
				type={type}
				schedule={schedule}
				manageUrl={manageUrl}
				// companyName={customer.companyName}
				// serviceTypeLabel={label}
				// scheduleDateTime={scheduleDateTime}
				// memo={schedule.memo}
				// linkUrl={manageUrl}
			/>
		);

		await resend.emails.send({
			from: EMAIL_FROM,
			to: ADMIN_EMAILS,
			subject: scheduleSubjectMap[type],
			html: adminHtml,
		});
	}
}
