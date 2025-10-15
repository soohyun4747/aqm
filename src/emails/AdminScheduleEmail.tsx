import * as React from 'react';
import { Html, Head, Body, Container, Text, Hr } from '@react-email/components';
import { scheduleSubjectMap, ScheduleMailType } from './CustomerScheduleEmail';
import { toLocaleStringWithoutSec } from '../utils/date';
import { ISchedule } from '../utils/supabase/schedule';
import { serviceNames } from '../utils/supabase/companyServices';

export interface AdminScheduleEmailProps {
	type: ScheduleMailType;
	schedule: ISchedule;
	manageUrl: string;
}

export default function AdminScheduleEmail(props: AdminScheduleEmailProps) {
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
						{scheduleSubjectMap[type]}
					</Text>
					<Hr />
					<Text>
						회사/고객: <b>{schedule.companyName}</b>
					</Text>
					<Text>
						서비스: <b>{serviceNames[schedule.serviceType]}</b>
					</Text>
					<Text>
						일정: <b>{toLocaleStringWithoutSec(schedule.scheduledAt)}</b>
					</Text>
					{schedule.memo ? <Text>메모: {schedule.memo}</Text> : null}
					<Hr />
					<Text>
						관리페이지:{' '}
						<a
							href={manageUrl}
							target='_blank'
							rel='noreferrer'>
							{manageUrl}
						</a>
					</Text>
					<Text style={{ color: '#778', fontSize: 12 }}>
						시스템 자동 알림
					</Text>
				</Container>
			</Body>
		</Html>
	);
}
