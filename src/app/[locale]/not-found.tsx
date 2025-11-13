'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

const TEXT: Record<string, { title: string; desc: string; home: string }> = {
  en: {
    title: "Page not found",
    desc: "The page you’re looking for doesn’t exist or has moved.",
    home: "Back to home",
  },
  es: {
    title: "Página no encontrada",
    desc: "La página que buscas no existe o se ha movido.",
    home: "Volver al inicio",
  },
  sr: {
    title: "Stranica nije pronađena",
    desc: "Stranica koju tražiš ne postoji ili je premještena.",
    home: "Povratak na početnu",
  },
};

export default function NotFound() {
  const locale = useLocale();
  const t = TEXT[locale] ?? TEXT.en;

  return (
    <main className="mx-auto max-w-4xl px-4 py-16 text-center">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-zinc-300 dark:border-emerald-500/30">
        <span className="text-2xl">🔍</span>
      </div>
      <h1 className="mt-6 text-2xl sm:text-3xl font-bold tracking-tight">{t.title}</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-300">{t.desc}</p>

      <div className="mt-6">
        <Link
          href={`/${locale}`}
          className="inline-block rounded-lg px-4 py-2 border border-zinc-300 dark:border-emerald-500/30
                     text-zinc-800 dark:text-emerald-200 hover:bg-zinc-100 dark:hover:bg-emerald-500/10"
        >
          {t.home}
        </Link>
      </div>
    </main>
  );
}
