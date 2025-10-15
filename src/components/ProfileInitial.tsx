import { useMemo } from 'react';
import {
	profileColors,
	ProfileColorType,
	ProfileIconProps,
} from './ProfileIcon';

interface ProfileInitialProps extends ProfileIconProps {
	email: string;
	onClick?: () => void;
}

export function getProfileColorByInitial(initial: string): ProfileColorType {
	if (!initial || typeof initial !== 'string') return 'gray';

	const firstChar = initial.trim().charAt(0).toLowerCase();

	// 알파벳이 아닐 경우 gray로 처리
	if (!/[a-z]/.test(firstChar)) return 'gray';

	const code = firstChar.charCodeAt(0); // 'a' = 97, 'z' = 122
	const range = Math.floor((code - 97) / 3); // 26자를 9개 색으로 균등 분배 (대략 3자씩)

	const colorMap: ProfileColorType[] = [
		'red', // a, b, c
		'orange', // d, e, f
		'yellow', // g, h, i
		'green', // j, k, l
		'teal', // m, n, o
		'indigo', // p, q, r
		'purple', // s, t, u
		'pink', // v, w, x
		'gray', // y, z
	];

	return colorMap[Math.min(range, colorMap.length - 1)];
}

export function ProfileInitial(props: ProfileInitialProps) {
	const initial = useMemo(() => {
		return props.email.slice(0, 2).toUpperCase();
	}, [props.email]);

	const color = getProfileColorByInitial(initial);

	return (
		<div
			onClick={props.onClick}
			style={{ background: profileColors[color].sub }}
			className='size-8 rounded-full flex items-center justify-center hover:cursor-pointer'>
			<p
				style={{ color: profileColors[color].main }}
				className='body-sm-regular text-center'>
				{initial}
			</p>
		</div>
	);
}
