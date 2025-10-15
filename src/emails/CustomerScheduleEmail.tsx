import * as React from 'react';
import { Html, Head, Body, Container, Text, Hr } from '@react-email/components';
import { toLocaleStringWithoutSec } from '../utils/date';
import { ISchedule } from '../utils/supabase/schedule';
import { serviceNames } from '../utils/supabase/companyServices';

export type ScheduleMailType =
	| 'requested'
	| 'confirmed'
	| 'edited'
	| 'cancelled';

export interface CustomerScheduleEmailProps {
	type: ScheduleMailType;
	schedule: ISchedule;
    manageUrl: string;
	// companyName: string;
	// serviceTypeLabel: string;
	// scheduleDateTime: string; // 로컬 표시 문자열
	// memo?: string | null;
	// manageUrl: string;
}

export const scheduleSubjectMap = {
	requested: '스케줄이 요청되었습니다',
	confirmed: '스케줄이 확정되었습니다',
	edited: '스케줄이 수정되었습니다',
	cancelled: '스케줄이 취소되었습니다',
} as const;

export default function CustomerScheduleEmail(
	props: CustomerScheduleEmailProps
) {
	const {
		type,
		schedule,
        manageUrl
	} = props;

	return (
		<Html lang='ko'>
			<Head />
			<Body
				style={{
					backgroundColor: '#f6f7fb',
					fontFamily: 'Apple SD Gothic Neo, Arial',
				}}>
				<Container
					style={{
						backgroundColor: '#fff',
						padding: '24px',
						borderRadius: 12,
						maxWidth: 560,
					}}>
					<Text style={{ fontSize: 18, fontWeight: 700 }}>
						{schedule.companyName}님, {scheduleSubjectMap[type]}
					</Text>
					<Hr />
					<Text>
						서비스: <b>{serviceNames[schedule.serviceType]}</b>
					</Text>
					<Text>
						일정: <b>{toLocaleStringWithoutSec(schedule.scheduledAt)}</b>
					</Text>
					{schedule.memo ? <Text>메모: {schedule.memo}</Text> : null}
					<Hr />
					<Text>
						자세한 내용은 사이트에서 확인하실 수 있습니다.
						<br />
						<a
							href={manageUrl}
							target='_blank'
							rel='noreferrer'>
							{manageUrl}
						</a>
					</Text>
					<Text style={{ color: '#778', fontSize: 12 }}>
						본 메일은 발신 전용입니다.
					</Text>
				</Container>
			</Body>
		</Html>
	);
}
