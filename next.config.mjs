import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async redirects() {
    return [
      // 1) root -> default locale
      {
        source: '/',
        destination: '/en',
        permanent: true,
      },

      // 2) sve bez locale prefiksa -> /en/...
      // (izuzimamo Next interne rute i "specijalne" fajlove)
      {
        source:
          '/((?!en/|es/|sr/|_next/|api/|favicon.ico|robots.txt|sitemap.xml|sitemap-news.xml|opensearch.xml|ads.txt|app-ads.txt|manifest.webmanifest).*)',
        destination: '/en/$1',
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
