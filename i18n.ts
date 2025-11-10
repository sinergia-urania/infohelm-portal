// i18n.ts (ROOT)
import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'es', 'sr'] as const;
export type Locale = typeof locales[number];

export const defaultLocale: Locale = 'en';
export const localePrefix = 'always';

type Messages = Record<string, unknown>;

const loaders: Record<Locale, () => Promise<Messages>> = {
  en: () => import('./src/lib/i18n/messages/en').then(m => m.default),
  es: () => import('./src/lib/i18n/messages/es').then(m => m.default),
  sr: () => import('./src/lib/i18n/messages/sr').then(m => m.default)
};

// (ostaje zbog middleware-a i API-ja, ok je da stoji)
export default getRequestConfig(async ({ locale }) => {
  const l = typeof locale === 'string' ? locale : defaultLocale;
  const safe: Locale = (locales as readonly string[]).includes(l) ? (l as Locale) : defaultLocale;
  return { locale: safe, messages: await loaders[safe]() };
});

// ✅ DIRECT LOADER za layout (zaobilazi getMessages)
export async function loadMessages(locale?: string) {
  const l = typeof locale === 'string' ? locale : defaultLocale;
  const safe: Locale = (locales as readonly string[]).includes(l) ? (l as Locale) : defaultLocale;
  return loaders[safe]();
}
