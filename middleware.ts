// middleware.ts
import createMiddleware from 'next-intl/middleware';
import {NextRequest, NextResponse} from 'next/server';
import {locales, defaultLocale, localePrefix} from './i18n';

// Bazni next-intl middleware (bez auto-detekcije)
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix,
  localeDetection: false
});

// Ex-YU zemlje -> sr
const EX_YU_COUNTRIES = new Set([
  'RS', // Srbija
  'BA', // Bosna i Hercegovina
  'HR', // Hrvatska
  'ME', // Crna Gora
  'MK', // Severna Makedonija
  'SI', // Slovenija
  'XK'  // Kosovo (Vercel ume da pošalje XK)
]);

// Španski svet -> es
const SPANISH_COUNTRIES = new Set([
  'ES', // Španija
  'MX', 'AR', 'CL', 'CO', 'PE', 'VE', 'UY', 'PY', 'BO', 'EC',
  'GT', 'CR', 'DO', 'SV', 'HN', 'NI', 'PA', 'PR', 'CU'
]);

function detectLocale(req: NextRequest): string {
  // 1) Ako postoji cookie od next-intl, uvek ga poštujemo
  const cookieLocale = req.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && locales.includes(cookieLocale as any)) {
    return cookieLocale;
  }

  // 2) Geo po zemlji (radi na Vercel-u preko x-vercel-ip-country headera)
  const country = (req.headers.get('x-vercel-ip-country') || '').toUpperCase();

  if (EX_YU_COUNTRIES.has(country)) return 'sr';
  if (SPANISH_COUNTRIES.has(country)) return 'es';

  // 3) Accept-Language header kao fallback
  const acceptLanguage = req.headers.get('accept-language') || '';

  // ex-YU jezici -> sr
  if (/sr|hr|bs|sl/i.test(acceptLanguage)) return 'sr';

  // španski -> es
  if (/es/i.test(acceptLanguage)) return 'es';

  // 4) Konačni fallback – defaultLocale ili en
  return defaultLocale ?? 'en';
}

function isBypassPath(pathname: string) {
  // Next internals + API
  if (pathname.startsWith('/_next')) return true;
  if (pathname.startsWith('/api')) return true;

  // Public assets (kod tebe slike idu ovde)
  if (pathname.startsWith('/images')) return true;
  if (pathname.startsWith('/icons')) return true;
  if (pathname.startsWith('/assets')) return true;
  if (pathname.startsWith('/fonts')) return true;

  // Specijalni fajlovi / rute
  if (pathname === '/favicon.ico') return true;
  if (pathname === '/robots.txt') return true;
  if (pathname === '/sitemap.xml') return true;
  if (pathname === '/sitemap-news.xml') return true;
  if (pathname === '/opensearch.xml') return true;
  if (pathname === '/ads.txt') return true;
  if (pathname === '/app-ads.txt') return true;
  if (pathname === '/manifest.webmanifest') return true;
  if (pathname === '/feed.xml') return true;

  return false;
}

export default function middleware(req: NextRequest) {
  const {pathname} = req.nextUrl;

  // Ne diramo statiku/specijalne fajlove
  if (isBypassPath(pathname)) {
    return NextResponse.next();
  }

  // Ako path već ima prefiks /en, /es, /sr → puštamo intlMiddleware
  const hasLocalePrefix = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (hasLocalePrefix) {
    return intlMiddleware(req);
  }

  // Specijalno ponašanje za root "/": geo/accept-language detekcija
  if (pathname === '/') {
    const locale = detectLocale(req);
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}`;
    return NextResponse.redirect(url, {status: 308});
  }

  // Sve ostalo bez prefiksa → stabilno preusmeri na defaultLocale
  // (ne radimo geo ovde, da Google uvek dobije isti canonical URL)
  const url = req.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.redirect(url, {status: 308});
}

// Matcher – hvata i unprefixed rute, ali preskače statiku i specijalne fajlove
export const config = {
  matcher: [
    // hvataj sve osim api/_next i "pravih fajlova" sa ekstenzijom na kraju
    '/((?!api|_next|.*\\.[a-zA-Z0-9]{2,5}$).*)',

    // ali ipak obradi feed.xml rute (jer su validne rute, i treba redirect)
    '/:path*/feed.xml',
  ],
};
