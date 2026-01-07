import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ✅ hard-stop za “fantom” /en/$1 (i varijante)
  async redirects() {
    return [
      {
        source: '/:locale(en|es|sr)/$1',
        destination: '/:locale',
        permanent: false,
      },
      {
        source: '/$1',
        destination: '/',
        permanent: false,
      },
    ];
  },

  // ✅ smanji dev “route cache” da se $1 ne vraća nakon izmena middleware/matcher-a
  onDemandEntries: {
    maxInactiveAge: 10 * 1000, // 10s
    pagesBufferLength: 1,
  },
};

export default withNextIntl(nextConfig);
