'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';

type Labels = { home: string; about: string; disclosure: string; rights: string };
const LABELS: Record<string, Labels> = {
  en: {
    home: 'Home',
    about: 'About',
    disclosure: 'Disclosure',
    rights: 'All rights reserved.',
  },
  es: {
    home: 'Inicio',
    about: 'Acerca',
    disclosure: 'Divulgación',
    rights: 'Todos los derechos reservados.',
  },
  sr: {
    home: 'Početna',
    about: 'O portalu',
    disclosure: 'Obaveštenje',
    rights: 'Sva prava zadržana.',
  },
};

const DISCLOSURE_NOTE: Record<string, string> = {
  en: 'Some posts may contain affiliate links. We may earn a commission at no extra cost to you.',
  es: 'Algunas publicaciones pueden contener enlaces de afiliado. Podemos ganar una comisión sin costo extra para ti.',
  sr: 'Neki tekstovi sadrže affiliate linkove. Možemo dobiti proviziju bez dodatnog troška za vas.',
};

function hrefWithLocale(locale: string, href: string) {
  const norm = href.startsWith('/') ? href : `/${href}`;
  if (norm === '/') return `/${locale}`;
  return `/${locale}${norm}`;
}

export default function Footer() {
  const locale = useLocale();
  const t = LABELS[locale] ?? LABELS.en;
  const note = DISCLOSURE_NOTE[locale] ?? DISCLOSURE_NOTE.en;
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-yellow-500 bg-black text-zinc-300">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8">
        {/* linkovi */}
        <nav className="flex flex-wrap items-center gap-3 text-sm text-yellow-400">
          <Link className="hover:underline" href={hrefWithLocale(locale, '/')}>
            {t.home}
          </Link>
          <span className="text-zinc-600">•</span>
          <Link className="hover:underline" href={hrefWithLocale(locale, '/about')}>
            {t.about}
          </Link>
          <span className="text-zinc-600">•</span>
          {/* vodi na anchor u About: #disclosure */}
          <Link
            className="hover:underline"
            href={hrefWithLocale(locale, '/about#disclosure')}
          >
            {t.disclosure}
          </Link>
        </nav>

        {/* autorska prava */}
        <p className="text-xs text-zinc-400">
          © {year} InfoHelm Tech · {t.rights}
        </p>

        {/* kratka napomena o affiliate linkovima */}
        <p className="max-w-2xl text-[11px] leading-snug text-zinc-500">
          {note}
        </p>
      </div>
    </footer>
  );
}
