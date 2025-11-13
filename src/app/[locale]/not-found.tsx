'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';

type Locale = 'en' | 'es' | 'sr';

const TEXT: Record<Locale, { title: string; desc: string; back: string }> = {
  en: {
    title: 'Page not found',
    desc: 'The page you are looking for does not exist or has moved.',
    back: 'Back to home',
  },
  es: {
    title: 'Página no encontrada',
    desc: 'La página que buscas no existe o se ha movido.',
    back: 'Volver al inicio',
  },
  sr: {
    title: 'Stranica nije pronađena',
    desc: 'Stranica koju tražiš ne postoji ili je premeštena.',
    back: 'Nazad na početnu',
  },
};

export default function NotFoundPage() {
  const locale = (useLocale() as Locale) ?? 'en';
  const t = TEXT[locale] ?? TEXT.en;

  const hrefHome = `/${locale}`;

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-sm text-emerald-400 mb-2">404</p>
      <h1 className="text-3xl font-bold text-emerald-300 tracking-tight">
        {t.title}
      </h1>
      <p className="mt-3 text-zinc-300 max-w-xl">
        {t.desc}
      </p>

      <div className="mt-8">
        <Link
          href={hrefHome}
          className="inline-flex items-center rounded-full border border-emerald-500/40
                     px-4 py-2 text-sm font-medium text-emerald-200
                     hover:bg-emerald-500/10 hover:border-emerald-400 transition"
        >
          ← {t.back}
        </Link>
      </div>
    </main>
  );
}
