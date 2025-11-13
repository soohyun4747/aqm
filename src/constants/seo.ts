import type { DefaultSeoProps } from 'next-seo';

export const SITE_URL = process.env.APP_BASE_URL ?? 'https://cncaqm.com';

const defaultImage = `${SITE_URL}/logo.svg`;

export const defaultSEOConfig: DefaultSeoProps = {
        title: 'AQM Square | AQM 검사 및 필터 교체 관리 웹',
        description:
                'AQM Square로 병원 AQM 검사와 필터 교체 관리 서비스를 받으세요',
        canonical: SITE_URL,
        openGraph: {
                url: SITE_URL,
                title: 'AQM Square | AQM 검사 및 필터 교체 관리 웹',
                description:
                        'AQM Square로 병원 AQM 검사와 필터 교체 관리 서비스를 받으세요',
                siteName: 'AQM Square',
                type: 'website',
                images: [
                        {
                                url: defaultImage,
                                width: 1200,
                                height: 630,
                                alt: 'AQM 로고',
                        },
                ],
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
