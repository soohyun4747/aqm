import '@/src/styles/globals.css';
import { AppProps } from 'next/app';
import { useEffect } from 'react';
import { screenTypes, useScreenTypeStore } from '../stores/screenTypeStore';
import { ICompany, useUserStore } from '../stores/userStore';
import { fetchProfileWithId } from '../utils/supabase/profile';
import { fetchCompanyWithCompanyId } from '../utils/supabase/company';
import { useRouter, usePathname } from 'next/navigation';
import { fetchSession } from '../utils/supabase/session';
import { useSelectedCompanyStore } from '../stores/selectedCompanyStore';
import LoadingOverlay from '../components/LoadingOverlay';

function App({ Component, pageProps }: AppProps) {
	const setScreenType = useScreenTypeStore((state) => state.setScreenType);
	const setUser = useUserStore((state) => state.setUser);
	const setCompany = useSelectedCompanyStore((state) => state.setCompany);

	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		const checkIsMobile = () => {
			setScreenType(
				window.innerWidth < 800 ? screenTypes.mobile : screenTypes.pc
			);
		};

		checkIsMobile(); // 최초 실행
		window.addEventListener('resize', checkIsMobile);
		return () => window.removeEventListener('resize', checkIsMobile);
	}, [setScreenType]);

	// ✅ 이미 로그인된 세션이 있는지 체크 → 있으면 프로필/회사 불러와 저장 후 이동
	useEffect(() => {
		let ignore = false;
		(async () => {
			try {
				const session = await fetchSession();
				const authUser = session?.user;

				if (!authUser) {
					router.replace('/');
					return;
				}

				const profile = await fetchProfileWithId(authUser.id);
				if (!profile) {
					router.replace('/');
					return;
				}

				let company: ICompany | undefined;
				if (profile.role === 'company' && profile.company_id) {
					company = await fetchCompanyWithCompanyId(
						profile.company_id
					);
				}

				if (!ignore) {
					setUser({
						id: authUser.id,
						userType: profile.role,
						company,
					});

					if (company) {
						setCompany(company);
					}

					// ✅ role과 pathname 기준으로 라우팅 분기
					if (
						profile.role === 'admin' &&
						!pathname?.startsWith('/admin')
					) {
						router.replace('/admin/calendar');
					} else if (
						profile.role === 'company' &&
						pathname?.startsWith('/admin')
					) {
						router.replace('/calendar');
					}
				}
			} catch (e) {
				console.error('session bootstrap error:', e);
				router.replace('/');
			}
		})();

		return () => {
			ignore = true;
		};
	}, [setUser, router, pathname]);

	return (
		<div className='min-h-dvh bg-background text-foreground'>
			<Component {...pageProps} />
			<LoadingOverlay />
		</div>
	);
}

export default App;
