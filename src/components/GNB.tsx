import Image from 'next/image';
import { useRouter } from 'next/router';
import { NotificationBell } from './Notification';
import { ProfileInitial } from './ProfileInitial';
import { screenTypes, useScreenTypeStore } from '@/src/stores/screenTypeStore';
import { NotificationMob } from './NotificationMob';
import { IconButton } from './IconButton';
import { Menu } from './icons/Menu';
import { ChevronRight } from './icons/ChevronRight';
import { useEffect, useState } from 'react';
import { userTypes, useUserStore } from '@/src/stores/userStore';
import { supabaseClient } from '@/lib/supabase/client';
import { logout } from '../utils/supabase/login';

const adminPathTitles: { [key: string]: string } = {
	'/admin/calendar': '캘린더',
	'/admin/companies': '고객목록',
	'/admin/managementRecords': '관리기록',
};

const companyPathTitles: { [key: string]: string } = {
	'/calendar': '캘린더',
	'/managementRecords': '관리기록',
};

const menuId = 'menu';
const adminEmail = 'cnc@admin.com';

export function GNB() {
	const [menuOpen, setMenuOpen] = useState(false);
	const user = useUserStore((state) => state.user);

	const pathTitles =
		user?.userType === userTypes.company
			? companyPathTitles
			: adminPathTitles;

	const router = useRouter();
	const screenType = useScreenTypeStore((state) => state.screenType);

	useEffect(() => {
		// Add click listener to the document
		document.addEventListener('click', handleClickOutside);

		// Cleanup the listener on component unmount
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	}, []);

	const handleClickOutside = (e: MouseEvent) => {
		const target = e.target as HTMLElement | undefined;

		if (target && target.id === menuId) {
			setMenuOpen(true);
		} else {
			setMenuOpen(false); // Change state when clicking outside
		}
	}

	return (
		<>
			{screenType === screenTypes.pc ? (
				<div className='px-6 py-3 bg-white border-b border-Gray-200 flex items-center justify-between no-print'>
					<div className='flex items-center gap-8'>
						<Image
							src={'/Logo.svg'}
							alt={'logo'}
							width={157.33}
							height={28}
						/>
						{Object.values(pathTitles).map((menu, i) => (
							<p
								onClick={() =>
									router.push(Object.keys(pathTitles)[i])
								}
								style={{
									color:
										pathTitles[router.pathname] === menu
											? '#1C64F2'
											: '#111928',
								}}
								className='body-lg-medium hover:cursor-pointer'>
								{menu}
							</p>
						))}
					</div>
					<div className='flex items-center gap-4'>
						{/* <NotificationBell /> */}
						<ProfileInitial
							email={
								user?.userType === 'admin'
									? adminEmail
									: user?.company?.email ?? ''
							}
							color={'gray'}
						/>
						<div className='w-[1px] h-[32px] bg-Gray-200' />
						<p
							onClick={logout}
							className='body-lg-medium text-Primary-600 hover:cursor-pointer'>
							Logout
						</p>
					</div>
				</div>
			) : (
				<div className='flex flex-col'>
					<div className='px-4 h-[60px] flex items-center justify-between'>
						<Image
							src={'/Logo.svg'}
							alt={'logo'}
							width={157.33}
							height={28}
						/>
						<div className='flex items-center gap-4'>
							<NotificationMob />
							<IconButton
								id={menuId}
								icon={<Menu id={menuId} />}
								onClick={() => setMenuOpen(true)}
							/>
							<ProfileInitial
								email={'soohyun4747@gmail.com'}
								color={'orange'}
							/>
						</div>
					</div>
					{menuOpen && (
						<div
							style={{
								boxShadow:
									'0px 4px 6px -1px rgba(0,0,0,0.1), 0px 2px 4px -2px rgba(0,0,0,0.05)',
							}}
							className='flex flex-col bg-white '>
							{Object.values(pathTitles).map((menu, i) => (
								<>
									{i !== 0 && (
										<div className='h-[1px] self-stretch bg-Gray-100' />
									)}
									{pathTitles[menu] === router.pathname ? (
										<div className='px-4 py-3 items-center justify-between'>
											<p className='body-md-medium text-Primary-600'>
												{menu}
											</p>
											<ChevronRight
												size={12}
												fill='#1C64F2'
											/>
										</div>
									) : (
										<div className='px-4 py-3 items-center'>
											<p className='body-md-medium text-Gray-900'>
												{menu}
											</p>
										</div>
									)}
								</>
							))}
						</div>
					)}
				</div>
			)}
		</>
	);
}
