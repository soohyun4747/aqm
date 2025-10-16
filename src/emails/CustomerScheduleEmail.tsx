import * as React from 'react';
import { Html, Head, Body, Container, Text, Hr } from '@react-email/components';
import { formatDateTimeString } from '../utils/date';
import { serviceNames } from '../utils/supabase/companyServices';
import {
	ScheduleEmailProps,
	scheduleSubjectMap,
} from '../server/scheduleEmail';

export default function CustomerScheduleEmail(props: ScheduleEmailProps) {
	const { type, schedule, manageUrl, agent } = props;

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
						주체:{' '}
						<b>
							{agent === 'company'
								? '고객'
								: '관리자'}
						</b>
					</Text>
					<Text>
						서비스: <b>{serviceNames[schedule.serviceType]}</b>
					</Text>
					<Text>
						일정:{' '}
						<b>{formatDateTimeString(schedule.scheduledAt)}</b>
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
