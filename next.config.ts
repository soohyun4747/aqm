import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
        eslint: { ignoreDuringBuilds: true },
        webpack: (config) => {
                config.resolve.alias['next-seo'] = path.resolve(__dirname, 'src/lib/next-seo');
                return config;
        },
};

export default nextConfig;
