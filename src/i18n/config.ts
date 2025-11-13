// src/i18n/config.ts
export const i18n = {
  locales: ['en', 'es', 'sr'] as const,
  defaultLocale: 'en' as const,
  // Force prefix za sve jezike -> /en, /es, /sr
  localePrefix: 'always' as const
};

export type Locale = typeof i18n.locales[number];
