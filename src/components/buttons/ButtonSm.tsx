import { ButtonProps, buttonVariants } from './Button';

export function ButtonSm(props: ButtonProps) {
	return (
		<button
			{...props}
			className={`hover:cursor-pointer px-2 py-1 flex justify-center items-center gap-2 shrink-0 rounded-[6px] body-sm-medium ${
				buttonVariants[props.variant ?? 'primary']
			}`}>
			{props.children}
		</button>
	);
}
