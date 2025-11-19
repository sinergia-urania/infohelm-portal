// src/components/Header.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import LanguageSwitcher from './LanguageSwitcher';

const LABELS: Record<
  string,
  { home: string; about: string; menu: string; theme: string; dark: string; light: string }
> = {
  en: { home: 'Home', about: 'About', menu: 'Menu', theme: 'Theme', dark: 'Dark', light: 'Light' },
  es: { home: 'Inicio', about: 'Acerca', menu: 'Menú', theme: 'Tema', dark: 'Oscuro', light: 'Claro' },
  sr: { home: 'Početna', about: 'O portalu', menu: 'Meni', theme: 'Tema', dark: 'Tamni', light: 'Svetli' },
};

// Kategorije (isti redosled kao na sajtu; Apps dodata na kraj)
const CAT_DEF = [
  { slug: 'news', en: 'News', es: 'Novedades', sr: 'Novosti' },
  { slug: 'new-tech', en: 'New Technologies', es: 'Nuevas tecnologías', sr: 'Nove tehnologije' },
  { slug: 'crypto-economy', en: 'Crypto & Economy', es: 'Cripto y economía', sr: 'Kripto i ekonomija' },
  { slug: 'science-space', en: 'Science & Space', es: 'Ciencia y espacio', sr: 'Nauka i svemir' },
  { slug: 'reviews', en: 'Device Reviews', es: 'Reseñas de dispositivos', sr: 'Recenzije uređaja' },
  { slug: 'software-gaming', en: 'Software & Gaming', es: 'Software y gaming', sr: 'Softver i gejming' },
  {
    slug: 'lifestyle-entertainment',
    en: 'Lifestyle & Entertainment',
    es: 'Estilo de vida y entretenimiento',
    sr: 'Lifestyle i zabava',
  },
  { slug: 'apps', en: 'Apps', es: 'Aplicaciones', sr: 'Aplikacije' },
] as const;

function hrefWithLocale(locale: string, href: string) {
  const norm = href.startsWith('/') ? href : `/${href}`;
  if (norm === '/') return `/${locale}`;
  return `/${locale}${norm}`;
}

// === Theme toggle (dark <-> light) ===
function ThemeToggle({
  label,
  darkLabel,
  lightLabel,
}: {
  label: string;
  darkLabel: string;
  lightLabel: string;
}) {
  const [mounted, setMounted] = React.useState(false);
  const [isDark, setIsDark] = React.useState(true); // default dark

  React.useEffect(() => {
    setMounted(true);
    try {
      const ls = localStorage.getItem('theme');
      const wantDark = ls ? ls === 'dark' : true; // default: dark
      setIsDark(wantDark);
      const doc = document.documentElement;
      if (wantDark) doc.classList.add('dark');
      else doc.classList.remove('dark');
    } catch {}
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    const doc = document.documentElement;
    if (isDark) doc.classList.add('dark');
    else doc.classList.remove('dark');
  }, [isDark, mounted]);

  const toggle = React.useCallback(() => {
    try {
      const next = !isDark;
      setIsDark(next);
      const doc = document.documentElement;
      if (next) {
        doc.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        doc.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    } catch {}
  }, [isDark]);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`${label}: ${isDark ? darkLabel : lightLabel}`}
      title={`${label}: ${isDark ? darkLabel : lightLabel}`}
      className="inline-flex items-center justify-center w-10 h-10 rounded-md border border-[#39ff14]/40 hover:bg-black/60 text-[#39ff14]"
    >
      <span aria-hidden="true" className="text-lg leading-none">
        {mounted && !isDark ? '☀️' : '🌙'}
      </span>
    </button>
  );
}

/** Mobilni off-canvas */
function OffCanvas(props: {
  locale: string;
  navPrimary: Array<{ label: string; href: string }>;
  categories: Array<{ slug: string; label: string; href: string }>;
  activeCatHref?: string;
  onClose: () => void;
}) {
  const { locale, navPrimary, categories, activeCatHref, onClose } = props;
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    const id = requestAnimationFrame(() => setShow(true));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  const handleClose = React.useCallback(() => {
    setShow(false);
    setTimeout(onClose, 200);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-120 md:hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/70 transition-opacity duration-200 ${
          show ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
        onClick={handleClose}
      />
      {/* Panel */}
      <aside
        className={`absolute right-0 top-0 z-10 h-full w-80 max-w-[85%]
                    bg-black text-[#39ff14]
                    border-l border-[#39ff14]/30 p-4 flex flex-col shadow-2xl
                    transform transition-transform duration-200
                    ${show ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between">
          {/* MINI LOGO U OFF-CANVASU */}
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 overflow-hidden rounded-full ring-1 ring-[#39ff14]/60">
              <img
                src="/images/infohelm-helm.jpg"
                alt="InfoHelm logo"
                className="h-full w-full object-cover"
              />
            </span>
            <span className="text-sm font-semibold leading-tight">
              <span className="block text-amber-300">InfoHelm</span>
              <span className="block text-[10px] uppercase tracking-[0.22em] text-[#39ff14]">
                Tech
              </span>
            </span>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-[#39ff14]/40 hover:bg-black/60 text-[#39ff14]"
            aria-label="Close"
            onClick={handleClose}
            autoFocus
          >
            ✕
          </button>
        </div>

        <nav className="mt-4 flex flex-col gap-2">
          {navPrimary.map((item) => (
            <Link
              key={item.label}
              href={hrefWithLocale(props.locale, item.href)}
              className="justify-start text-left px-3 py-2 rounded-md text-sm border border-[#39ff14] hover:bg-[#39ff14]/10 text-[#39ff14]"
              onClick={handleClose}
            >
              {item.label}
            </Link>
          ))}

          <div className="mt-3 border-t border-[#39ff14]/30 pt-3 flex flex-col gap-2">
            {categories.map((c) => {
              const active = activeCatHref === c.href;
              return (
                <Link
                  key={c.href}
                  href={hrefWithLocale(props.locale, c.href)}
                  aria-current={active ? 'page' : undefined}
                  className={
                    'w-full text-left rounded-md px-3 py-2 text-sm border border-[#39ff14] text-[#39ff14] bg-black hover:bg-[#39ff14]/10 transition chips ' +
                    (active ? 'ring-1 ring-[#39ff14] bg-[#39ff14]/15 font-semibold' : '')
                  }
                  onClick={handleClose}
                >
                  {c.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>
    </div>,
    document.body,
  );
}

export default function Header() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = LABELS[locale] ?? LABELS.en;
  const [open, setOpen] = React.useState(false);
  const [portalReady, setPortalReady] = React.useState(false);

  React.useEffect(() => {
    setPortalReady(true);
  }, []);

  // Scroll lock
  React.useEffect(() => {
    const cls = 'overflow-hidden';
    if (open) document.body.classList.add(cls);
    else document.body.classList.remove(cls);
    return () => document.body.classList.remove(cls);
  }, [open]);

  const categories = React.useMemo(() => {
    return CAT_DEF.map((c) => ({
      slug: c.slug,
      label: ((c as any)[locale] as string) ?? c.en,
      href: `/c/${c.slug}`,
    }));
  }, [locale]);

  const newsLabel = categories.find((c) => c.slug === 'news')?.label ?? 'News';
  const navPrimary = [
    { label: newsLabel, href: '/c/news' },
    { label: t.about, href: '/about' },
  ];

  const normalize = (s: string) => (s.length > 1 && s.endsWith('/') ? s.slice(0, -1) : s);
  const isActive = (href: string) => normalize(pathname) === normalize(hrefWithLocale(locale, href));

  const NavLink = ({
    href,
    children,
    className = '',
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <Link
      href={hrefWithLocale(locale, href)}
      className={
        'px-3 py-2 rounded-md text-sm transition-colors text-amber-300 hover:text-amber-200 ' +
        (isActive(href) ? 'underline underline-offset-4 decoration-amber-300 ' : '') +
        className
      }
      aria-current={isActive(href) ? 'page' : undefined}
      onClick={() => setOpen(false)}
    >
      {children}
    </Link>
  );

  // Čipovi: anti-wrap + snap + shrink fix za skrol
  const ChipLink = ({
    label,
    href,
    active,
  }: {
    label: string;
    href: string;
    active?: boolean;
  }) => (
    <Link
      href={hrefWithLocale(locale, href)}
      className={
        'chips inline-flex items-center rounded-full border px-3 py-1 text-sm text-[#39ff14] ' +
        'border-[#39ff14] bg-black/40 hover:bg-[#39ff14]/10 transition-colors whitespace-nowrap shrink-0 snap-start ' +
        (active ? 'ring-1 ring-[#39ff14] bg-[#39ff14]/15 font-semibold' : '')
      }
      aria-current={active ? 'page' : undefined}
      onClick={() => setOpen(false)}
    >
      {label}
    </Link>
  );

  const activeCatHref = categories.find((c) =>
    normalize(pathname).startsWith(normalize(hrefWithLocale(locale, `/c/${c.slug}`))),
  )?.href;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-emerald-500/20 bg-black text-emerald-300">
      {/* Gornja traka */}
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        {/* NOVI LOGO BLOK */}
        <Link
          href={hrefWithLocale(locale, '/')}
          className="flex items-center gap-3 group"
          aria-label="InfoHelm home"
        >
          <span className="inline-flex h-10 w-10 overflow-hidden rounded-full ring-2 ring-[#39ff14]/70 shadow-[0_0_18px_rgba(57,255,20,0.7)] group-hover:scale-105 transition-transform">
            <img
              src="/images/infohelm-helm.jpg"
              alt="InfoHelm logo"
              className="h-full w-full object-cover"
            />
          </span>
          <span className="leading-tight">
            <span className="block font-semibold tracking-tight text-amber-300 text-xl sm:text-2xl">
              InfoHelm
            </span>
            <span className="block text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#39ff14]">
              Tech
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navPrimary.map((item) => (
            <NavLink key={item.label} href={item.href}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Desno: jezik + theme + hamburger (z-index da dropdown ide iznad čipova) */}
        <div className="flex items-center gap-2 relative z-50">
          <LanguageSwitcher />
          <ThemeToggle label={t.theme} darkLabel={t.dark} lightLabel={t.light} />
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-[#39ff14]/40 hover:bg-black/60 text-[#39ff14]"
            aria-label={t.menu}
            onClick={() => setOpen(true)}
          >
            <span className="block w-5 h-0.5 bg-current" />
            <span className="block w-5 h-0.5 bg-current mt-1.5" />
            <span className="block w-5 h-0.5 bg-current mt-1.5" />
          </button>
        </div>
      </div>

      {/* Donja traka (desktop): kategorije kao čipovi + zlatne tačkice */}
      <div className="hidden md:block border-t border-b border-t-emerald-500/20 border-b-[#facc15]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-nowrap items-center gap-2 py-2 justify-center">
            {/* Početna tačkica */}
            <span aria-hidden className="text-xs leading-none text-amber-400 px-0.5">
              •
            </span>

            {categories.map((c) => (
              <React.Fragment key={c.href}>
                <ChipLink
                  label={c.label}
                  href={c.href}
                  active={activeCatHref === c.href}
                />

                {/* Tačkica posle svakog čipa (i na kraju reda) */}
                <span aria-hidden className="text-xs leading-none text-amber-400 px-0.5">
                  •
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Donja traka (mob): čipovi – horizontalni skrol, bez duplih tačkica */}
      <div className="md:hidden border-t border-b border-t-emerald-500/20 border-b-[#facc15] relative">
        {/* edge fade iz crne */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-linear-to-r from-black to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-linear-to-l from-black to-transparent" />
        <div
          className="-mx-4 px-4 overflow-x-auto overflow-y-hidden snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          <div className="flex gap-2 py-2 min-w-max">
            {categories.map((c) => (
              <ChipLink
                key={c.href}
                label={c.label}
                href={c.href}
                active={activeCatHref === c.href}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Off-canvas meni (mob) */}
      {portalReady && open && (
        <OffCanvas
          locale={locale}
          navPrimary={navPrimary}
          categories={categories}
          activeCatHref={activeCatHref}
          onClose={() => setOpen(false)}
        />
      )}
    </header>
  );
}
