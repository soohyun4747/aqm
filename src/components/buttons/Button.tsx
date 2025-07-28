import { CSSProperties } from 'react';

export const buttonVariants: { [key: string]: string } = {
	primary:
		'text-white bg-Primary-700 hover:bg-Primary-800 focus:bg-primary-800 focus:border-[3px] focus:border-Primary-200 disabled:bg-Primary-400',
	primaryOutline:
		'text-Primary-700 border border-Primary-700  hover:bg-Primary-800 hover:text-white focus:bg-Primary-800 focus:border-[3px] focus:border-Primary-200 focus:text-white disabled:borer-primary-400 disabled:text-Primary-400 disabled:bg-transparent',
	alternative:
		'text-black bg-white border border-Gray-200  hover:bg-transparent hover:text-Primary-700 focus:text-Primary-700 disabled:text-Gray-400',
	danger: 'text-white bg-Orange-700 hover:bg-Orange-800 focus:bg-Orange-800 focus:border-[3px] focus:border-Orange-300 disabled:bg-Orange-400',
} as const;

export type IButtonVariant =
	| 'primary'
	| 'primaryOutline'
	| 'alternative'
	| 'danger';

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	children: React.ReactNode;
	variant?: IButtonVariant;
	style?: CSSProperties;
	className?: string;
}

export function Button(props: ButtonProps) {
	return (
		<button
			{...props}
			className={`hover:cursor-pointer h-[37px] px-3 py-2 flex justify-center items-center gap-2 shrink-0 rounded-[8px] body-md-medium ${
				buttonVariants[props.variant ?? 'primary']
			} ${props.className}`}>
			{props.children}
		</button>
	);
}
