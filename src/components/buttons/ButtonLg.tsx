import { ButtonProps, buttonVariants } from './Button';

export function ButtonLg(props: ButtonProps) {
	return (
		<button
			{...props}
			className={`hover:cursor-pointer h-[50px] px-3 py-2 flex justify-center items-center gap-2 shrink-0 rounded-[8px] body-md-medium ${
				buttonVariants[props.variant ?? 'primary']
			}`}>
			{props.children}
		</button>
	);
}
