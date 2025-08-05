import { screenTypes, useScreenTypeStore } from '@/stores/screenTypeStore';
import '@/styles/globals.css';
import { AppProps } from 'next/app';
import { useEffect } from 'react';

function App({ Component, pageProps }: AppProps) {
	const setScreenType = useScreenTypeStore((state) => state.setScreenType);

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

	return <Component {...pageProps} />;
}

export default App;
