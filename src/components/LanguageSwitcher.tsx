// src/components/LanguageSwitcher.tsx
'use client';

import React from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';

const LOCALES = ['en', 'es', 'sr'] as const;
type Locale = (typeof LOCALES)[number];

// Skini /en|/es|/sr sa početka putanje
function stripLocale(pathname: string): string {
  const path = pathname || '/';
  const norm = path.startsWith('/') ? path : `/${path}`;
  const out = norm.replace(/^\/(en|es|sr)(?=\/|$)/, '');
  return out === '' ? '/' : out;
}

// Sastavi putanju UVEK sa prefiksom /{locale}
function buildLocalePath(next: Locale, pathname: string, qs: string): string {
  const rest = stripLocale(pathname);
  const tail = rest === '/' ? '' : rest; // bez duplog kosa crte
  return `/${next}${tail}${qs}`.replace(/\/+/g, '/');
}

// Ikonica globusa (nasleđuje currentColor)
function GlobeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M3 12h18M12 3c3 3.5 3 14 0 18M12 3c-3 3.5-3 14 0 18" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

/** Minimalne SVG zastave (US, ES, RS) — bez eksternih asseta */
function FlagIcon({ loc, className }: { loc: Locale; className?: string }) {
  switch (loc) {
    case 'en': // US stil za EN
      return (
        <svg viewBox="0 0 24 16" className={className} aria-hidden="true">
          {/* crveno-bijele pruge */}
          <rect width="24" height="16" fill="#B22234" />
          <g fill="#FFF">
            <rect y="2" width="24" height="2" />
            <rect y="6" width="24" height="2" />
            <rect y="10" width="24" height="2" />
            <rect y="14" width="24" height="2" />
          </g>
          {/* plavi kanton (bez zvezdica radi minimalizma) */}
          <rect width="10" height="8" fill="#3C3B6E" />
        </svg>
      );
    case 'es':
      return (
        <svg viewBox="0 0 24 16" className={className} aria-hidden="true">
          <rect width="24" height="16" fill="#AA151B" />
          <rect y="4" width="24" height="8" fill="#F1BF00" />
        </svg>
      );
    case 'sr':
      return (
        <svg viewBox="0 0 24 16" className={className} aria-hidden="true">
          <rect width="24" height="16" fill="#C6363C" />   {/* crvena */}
          <rect y="5.333" width="24" height="5.333" fill="#0C4076" /> {/* plava */}
          <rect y="10.666" width="24" height="5.334" fill="#FFFFFF" /> {/* bela */}
        </svg>
      );
  }
}

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname() || '/';
  const currentLocale = useLocale() as Locale;

  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  // Klik van menija + ESC
  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const changeLocale = (loc: Locale) => {
    const qs =
      typeof window !== 'undefined' && window.location.search
        ? window.location.search
        : '';
    const href = buildLocalePath(loc, pathname, qs);
    setOpen(false);
    router.push(href, { scroll: false });
  };

  return (
    <div ref={ref} className="relative">
      {/* Dugme — zlatna boja globusa */}
      <button
        type="button"
        aria-label="Change language"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="h-10 w-10 inline-flex items-center justify-center rounded-md
                   border border-emerald-500/30 hover:bg-black/60 text-amber-400"
      >
        <GlobeIcon className="h-5 w-5" />
      </button>

      {/* Dropdown — crn, zelene ivice/tekst, visoki z-index */}
      <div
        className={`absolute right-0 mt-2 min-w-40 overflow-hidden rounded-md
                    border border-emerald-500/30 bg-black text-amber-400 shadow-2xl z-50
                    origin-top-right transform transition
                    ${open ? 'opacity-100 scale-100' : 'pointer-events-none opacity-0 scale-95'}`}
        role="menu"
      >
        {LOCALES.map((loc) => {
          const active = currentLocale === loc;
          return (
            <button
              key={loc}
              type="button"
              onClick={() => changeLocale(loc)}
              className={`flex w-full items-center gap-3 px-3 py-2 text-sm
                          hover:bg-emerald-500/10
                          ${active ? 'text-amber-400 font-semibold' : ''}`}
              role="menuitem"
            >
              <FlagIcon loc={loc} className="w-5 h-3.5 shrink-0" />
              <span className="font-medium tracking-wide">{loc.toUpperCase()}</span>
              {active ? <span aria-hidden className="ml-auto">✓</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
