// src/i18n/request.ts
import {getRequestConfig} from 'next-intl/server';
import {i18n} from './config';

export default getRequestConfig(async ({locale}) => {
  const supported = i18n.locales as readonly string[];
  const lang = supported.includes(locale as any) ? locale : i18n.defaultLocale;

  const messages = (await import(`../lib/i18n/messages/${lang}.ts`)).default;

  // TS traži i 'locale' u povratnoj vrednosti -> dodajemo ga
  return {
    locale: lang as string,
    messages
  };
});
