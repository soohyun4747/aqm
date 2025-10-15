export type ProfileColorType =
	| 'gray'
	| 'red'
	| 'orange'
	| 'yellow'
	| 'green'
	| 'teal'
	| 'indigo'
	| 'purple'
	| 'pink';

export interface ProfileIconProps {
	color?: ProfileColorType;
}

export const profileColors = {
	gray: { main: '#111928', sub: '#F3F4F6' },
	red: { main: '#771D1D', sub: '#FDE8E8' },
	orange: { main: '#771D1D', sub: '#FEECDC' },
	yellow: { main: '#633112', sub: '#FDF6B2' },
	green: { main: '#014737', sub: '#DEF7EC' },
	teal: { main: '#014451', sub: '#D5F5F6' },
	indigo: { main: '#362F78', sub: '#E5EDFF' },
	purple: { main: '#4A1D96', sub: '#EDEBFE' },
	pink: { main: '#751A3D', sub: '#FCE8F3' },
};

export function ProfileIcon(props: ProfileIconProps) {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			width='32'
			height='32'
			viewBox='0 0 32 32'
			fill='none'>
			<g clip-path='url(#clip0_54_959)'>
				<rect
					width='32'
					height='32'
					rx='16'
					fill={profileColors[props.color ?? 'gray'].sub}
				/>
				<path
					d='M20.6533 18.334C24.591 20.1101 27.333 24.0668 27.333 28.667C27.3328 34.9261 22.2591 40 16 40C9.74088 40 4.66716 34.9261 4.66699 28.667C4.66699 24.0671 7.40849 20.1102 11.3457 18.334C12.6118 19.3749 14.233 20 16 20C17.7668 20 19.3873 19.3747 20.6533 18.334ZM16 7.33301C18.9455 7.33301 21.333 9.72147 21.333 12.667C21.3328 15.6124 18.9454 18 16 18C13.0546 18 10.6672 15.6124 10.667 12.667C10.667 9.72147 13.0545 7.33301 16 7.33301Z'
					fill={profileColors[props.color ?? 'gray'].main}
				/>
			</g>
			<defs>
				<clipPath id='clip0_54_959'>
					<rect
						width='32'
						height='32'
						rx='16'
						fill='white'
					/>
				</clipPath>
			</defs>
		</svg>
	);
}
