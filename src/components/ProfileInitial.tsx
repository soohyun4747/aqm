import { useMemo } from 'react';
import { profileColors, ProfileIconProps } from './ProfileIcon';

interface ProfileInitialProps extends ProfileIconProps {
	email: string;
}

export function ProfileInitial(props: ProfileInitialProps) {
	const initial = useMemo(() => {
		return props.email.slice(0, 2).toUpperCase();
	}, [props.email]);

	return (
		<div
			style={{ background: profileColors[props.color].sub }}
			className='size-8 rounded-full flex items-center justify-center hover:cursor-pointer'>
			<p
				style={{ color: profileColors[props.color].main }}
				className='body-sm-regular text-center'>
				{initial}
			</p>
		</div>
	);
}
