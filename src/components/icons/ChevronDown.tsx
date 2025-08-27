import { IconProps } from '../IconButton';

export function ChevronDown(props: IconProps) {
	return (
		<svg
			id={props.id}
			xmlns='http://www.w3.org/2000/svg'
			width={props.size ?? '20'}
			height={props.size ?? '20'}
			viewBox='0 0 20 20'
			fill='none'>
			<path
				id={props.id}
				d='M9.99933 15C9.30919 15 8.6387 14.7188 8.16071 14.23L1.18601 7.1038C0.692303 6.59881 0.719804 5.80756 1.24756 5.33632C1.77531 4.86757 2.60557 4.89257 3.09796 5.39632L9.99933 12.4463L16.9007 5.39632C17.3931 4.89132 18.2247 4.86632 18.7511 5.33632C19.2788 5.80756 19.3077 6.59881 18.814 7.1038L11.8393 14.23C11.36 14.7188 10.6895 15 9.99933 15Z'
				fill={props.fill ?? '#1F2A37'}
			/>
		</svg>
	);
}
