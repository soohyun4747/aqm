import type { DefaultSeoProps } from 'next-seo';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aqm.example.com';

const defaultImage = `${SITE_URL}/login-bg.png`;

export const defaultSEOConfig: DefaultSeoProps = {
        title: 'AQM | 일정과 품질을 한 곳에서',
        description:
                'AQM으로 현장 스케줄과 품질 점검을 한 곳에서 관리하고 팀과 실시간으로 공유하세요.',
        canonical: SITE_URL,
        openGraph: {
                url: SITE_URL,
                title: 'AQM | 일정과 품질을 한 곳에서',
                description:
                        'AQM 대시보드에서 실시간 캘린더, 점검 기록, 담당자 정보를 빠르게 확인하세요.',
                siteName: 'AQM',
                type: 'website',
                images: [
                        {
                                url: defaultImage,
                                width: 1200,
                                height: 630,
                                alt: 'AQM 로그인 화면 미리보기',
                        },
                ],
        },
        twitter: {
                handle: '@aqm_official',
                site: '@aqm_official',
                cardType: 'summary_large_image',
        },
        additionalMetaTags: [
                {
                        name: 'theme-color',
                        content: '#080B12',
                },
        ],
        additionalLinkTags: [
                {
                        rel: 'icon',
                        href: '/favicon.svg',
                        type: 'image/svg+xml',
                },
                {
                        rel: 'apple-touch-icon',
                        href: '/favicon.svg',
                        sizes: '180x180',
                },
        ],
};
