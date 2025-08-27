import { ChangeEvent } from 'react';
import { Button } from './buttons/Button';
import { IconButton } from './IconButton';
import { Close } from './icons/Close';
import { Search } from './icons/Search';

interface SearchFieldProps {
	searchValue: string;
	onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
	onSearch?: () => void;
	onClear?: () => void;
}

export function SearchField(props: SearchFieldProps) {
	return (
		<div className='flex items-center gap-2 h-fit'>
			<div className='flex items-center px-4 py-2 gap-[10px] bg-Gray-50 border border-Gray-300 rounded-[8px] w-[325px]'>
				<Search
					fill='#6B7280'
					size={16}
				/>
				<input
					type='text'
					placeholder='검색어를 입력하세요'
					className='outline-0 body-sm-regular text-Gray-500 flex-1'
					onChange={props.onChange}
				/>
				<IconButton
					icon={
						<Close
							size={10}
							fill='#6B7280'
						/>
					}
					onClick={props.onClear}
				/>
			</div>
			<Button
				variant='primary'
				onClick={props.onSearch}>
				<Search
					fill='#FFFFFF'
					size={14}
				/>
			</Button>
		</div>
	);
}
