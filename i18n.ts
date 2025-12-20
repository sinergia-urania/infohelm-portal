// i18n.ts (ROOT)
import { getRequestConfig } from 'next-intl/server';
import { i18n } from './src/i18n/config';

export const locales = i18n.locales;
export type Locale = typeof locales[number];

export const defaultLocale: Locale = i18n.defaultLocale;
export const localePrefix = i18n.localePrefix;

type Messages = Record<string, unknown>;

const loaders: Record<Locale, () => Promise<Messages>> = {
  en: () => import('./src/lib/i18n/messages/en').then(m => m.default),
  es: () => import('./src/lib/i18n/messages/es').then(m => m.default),
  sr: () => import('./src/lib/i18n/messages/sr').then(m => m.default)
};

export default getRequestConfig(async ({ locale }) => {
  const l = typeof locale === 'string' ? locale : defaultLocale;
  const safe: Locale = (locales as readonly string[]).includes(l) ? (l as Locale) : defaultLocale;
  return { locale: safe, messages: await loaders[safe]() };
});

export async function loadMessages(locale?: string) {
  const l = typeof locale === 'string' ? locale : defaultLocale;
  const safe: Locale = (locales as readonly string[]).includes(l) ? (l as Locale) : defaultLocale;
  return loaders[safe]();
}
