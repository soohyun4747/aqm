import { IconProps } from "../IconButton";

export function ChevronRight(props: IconProps) {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			width={props.size ?? '20'}
			height={props.size ?? '20'}
			viewBox='0 0 20 20'
			fill='none'>
			<g clip-path='url(#clip0_2018_9858)'>
				<path
					d='M12.4475 9.99967L5.39636 16.8993C4.89261 17.393 4.86511 18.2219 5.33636 18.7509C5.80635 19.28 6.60009 19.3075 7.10259 18.8138L14.2288 11.8395C14.7263 11.3524 15 10.7002 15 9.99967C15 9.29909 14.7263 8.64697 14.23 8.15984L7.10384 1.18554C6.86259 0.949834 6.55635 0.833291 6.2501 0.833291C5.9151 0.833291 5.58261 0.972096 5.33761 1.2484C4.86636 1.77743 4.89386 2.60502 5.39761 3.10001L12.4475 9.99967Z'
					fill={props.fill ?? '#1F2A37'}
				/>
			</g>
			<defs>
				<clipPath id='clip0_2018_9858'>
					<rect
						width='20'
						height='20'
						fill='white'
						transform='translate(20 20) rotate(-180)'
					/>
				</clipPath>
			</defs>
		</svg>
	);
}
