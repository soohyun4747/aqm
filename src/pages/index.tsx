import { Alert } from '@/components/alert/Alert';
import { ButtonGroup } from '@/components/ButtonGroup';
import { Button } from '@/components/buttons/Button';
import { ButtonLg } from '@/components/buttons/ButtonLg';
import { ButtonSm } from '@/components/buttons/ButtonSm';
import { Calendar } from '@/components/calendar/Calendar';
import { CalendarTopbar } from '@/components/CalendarTopbar';
import { Checkbox } from '@/components/Checkbox';
import { FileUpload } from '@/components/FileUpload';
import { FileUploadDrop } from '@/components/FileUploadDrop';
import { GNB } from '@/components/GNB';
import { Menu } from '@/components/icons/Menu';
import { InputBox } from '@/components/InputBox';
import { Modal } from '@/components/modal/Modal';
import { Radio } from '@/components/Radio';
import { SearchField } from '@/components/SearchField';

function MainPage() {
	return (
		<div className='flex flex-col gap-4 py-10'>
			<div className='flex gap-2'>
				<ButtonLg>Button Text</ButtonLg>
				<ButtonLg variant='primaryOutline'>Button Text</ButtonLg>
				<ButtonLg
					variant='primaryOutline'
					disabled>
					Button Text
				</ButtonLg>
				<ButtonLg variant='alternative'>Button Text</ButtonLg>
				<ButtonLg
					variant='alternative'
					disabled>
					Button Text
				</ButtonLg>
				<ButtonLg variant='danger'>Button Text</ButtonLg>
				<ButtonLg
					variant='danger'
					disabled>
					Button Text
				</ButtonLg>
			</div>
			<div className='flex gap-2'>
				<Button>Button Text</Button>
				<Button variant='primaryOutline'>Button Text</Button>
				<Button
					variant='primaryOutline'
					disabled>
					Button Text
				</Button>
				<Button variant='alternative'>Button Text</Button>
				<Button
					variant='alternative'
					disabled>
					Button Text
				</Button>
				<Button variant='danger'>Button Text</Button>
				<Button
					variant='danger'
					disabled>
					Button Text
				</Button>
			</div>
			<div className='flex gap-2'>
				<ButtonSm>Button Text</ButtonSm>
				<ButtonSm variant='primaryOutline'>Button Text</ButtonSm>
				<ButtonSm
					variant='primaryOutline'
					disabled>
					Button Text
				</ButtonSm>
				<ButtonSm variant='alternative'>Button Text</ButtonSm>
				<ButtonSm
					variant='alternative'
					disabled>
					Button Text
				</ButtonSm>
				<ButtonSm variant='danger'>Button Text</ButtonSm>
				<ButtonSm
					variant='danger'
					disabled>
					Button Text
				</ButtonSm>
			</div>
			<div className='flex gap-2'>
				<Radio
					label={'Write label text here'}
					subLabel='Some helper text here'
				/>
				<Radio
					selected
					label={'Write label text here'}
					subLabel='Some helper text here'
				/>
				<Radio
					disabled
					selected
					label={'Write label text here'}
					subLabel='Some helper text here'
				/>
			</div>
			<div className='flex gap-2'>
				<Checkbox
					label={'Write label text here'}
					subLabel='Some helper text here'
				/>
				<Checkbox
					selected
					label={'Write label text here'}
					subLabel='Some helper text here'
				/>
				<Checkbox
					disabled
					selected
					label={'Write label text here'}
					subLabel='Some helper text here'
				/>
			</div>
			<div className='flex gap-2'>
				<ButtonGroup
					buttons={[
						{ label: 'Calendar View', id: 'calendar' },
						{ label: 'List View', id: 'list' },
					]}
				/>
				<ButtonGroup
					buttons={[
						{ label: 'Calendar View', id: 'calendar' },
						{ label: 'List View', id: 'list' },
					]}
					selectedId={'calendar'}
				/>
			</div>
			<CalendarTopbar />
			{/* <Modal
				content={<p>hello</p>}
				firstBtnProps={{ children: 'close' }}
				secondBtnProps={{ children: 'hello' }}
			/>
			<Alert
				content={<p>hello</p>}
				firstBtnProps={{ children: 'close' }}
				secondBtnProps={{ children: 'hello' }}
				thirdBtnProps={{ children: 'cancel' }}
			/> */}
			<GNB />
			<InputBox
				label='first name'
				desc='write your first name'
			/>
			<Calendar
				year={2025}
				month={8}
			/>
			<SearchField searchValue={''}/>
			<FileUploadDrop/>
			<FileUpload/>
		</div>
	);
}

export default MainPage;
