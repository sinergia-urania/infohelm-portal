// middleware.ts (root)
import createMiddleware from 'next-intl/middleware';
import {locales, defaultLocale, localePrefix} from './src/i18n';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix,
  localeDetection: true
});

export const config = { matcher: ['/((?!_next|api|.*\\..*).*)'] };
