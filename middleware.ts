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

  // 2) Geo po zemlji (radi na Vercel-u)
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

export default function middleware(req: NextRequest) {
  const {pathname} = req.nextUrl;

  // Ako path već ima prefiks /en, /es, /sr → NE diramo, puštamo intlMiddleware
  const hasLocalePrefix = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (hasLocalePrefix) {
    return intlMiddleware(req);
  }

  // Specijalno ponašanje za root "/"
  if (pathname === '/') {
    const locale = detectLocale(req);
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}`;
    return NextResponse.redirect(url);
  }

  // Sve ostalo prepustimo next-intl middleware-u
  return intlMiddleware(req);
}

// Matcher – isto što si imao, da hvata root i lokalizovane rute
export const config = {
  matcher: ['/', '/(en|es|sr)/:path*']
};
