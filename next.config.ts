import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: []
  }
};

import('@opennextjs/cloudflare').then((m) => m.initOpenNextCloudflareForDev());

export default withNextIntl(nextConfig);
