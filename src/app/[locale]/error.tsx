'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

const TEXT: Record<string, { title: string; desc: string; retry: string; home: string }> = {
  en: {
    title: "Something went wrong",
    desc: "An unexpected error occurred. You can try again or go back home.",
    retry: "Try again",
    home: "Back to home",
  },
  es: {
    title: "Algo salió mal",
    desc: "Ocurrió un error inesperado. Puedes intentarlo de nuevo o volver al inicio.",
    retry: "Intentar de nuevo",
    home: "Volver al inicio",
  },
  sr: {
    title: "Nešto je pošlo naopako",
    desc: "Dogodila se neočekivana greška. Pokušaj ponovo ili se vrati na početnu.",
    retry: "Pokušaj ponovo",
    home: "Povratak na početnu",
  },
};

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useLocale();
  const t = TEXT[locale] ?? TEXT.en;

  React.useEffect(() => {
    // opciono: logovanje
    // console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <main className="mx-auto max-w-4xl px-4 py-16 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-zinc-300 dark:border-emerald-500/30">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="mt-6 text-2xl sm:text-3xl font-bold tracking-tight">{t.title}</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-300">{t.desc}</p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-lg px-4 py-2 border border-zinc-300 dark:border-emerald-500/30
                         text-zinc-800 dark:text-emerald-200 hover:bg-zinc-100 dark:hover:bg-emerald-500/10"
            >
              {t.retry}
            </button>
            <Link
              href={`/${locale}`}
              className="rounded-lg px-4 py-2 border border-zinc-300 dark:border-emerald-500/30
                         text-zinc-800 dark:text-emerald-200 hover:bg-zinc-100 dark:hover:bg-emerald-500/10"
            >
              {t.home}
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
