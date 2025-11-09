// i18n.ts (ROOT)
import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'es', 'sr'] as const;
export type Locale = typeof locales[number];

export const defaultLocale: Locale = 'en';
export const localePrefix = 'as-needed'; // ili 'always'

const loaders: Record<Locale, () => Promise<any>> = {
  en: () => import('./src/lib/i18n/messages/en').then(m => m.default),
  es: () => import('./src/lib/i18n/messages/es').then(m => m.default),
  sr: () => import('./src/lib/i18n/messages/sr').then(m => m.default)
};

export default getRequestConfig(async ({ locale }) => {
  const l = typeof locale === 'string' ? locale : defaultLocale;
  const safeLocale: Locale =
    (locales as readonly string[]).includes(l) ? (l as Locale) : defaultLocale;

  return {
    locale: safeLocale,
    messages: await loaders[safeLocale]()
  };
});
