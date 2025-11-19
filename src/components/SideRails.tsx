// src/components/SideRails.tsx
import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAllSlugs, loadPost } from '@/lib/mdx';

type Props = {
  children: React.ReactNode;
  left?: React.ReactNode;
  right?: React.ReactNode;
  /** Sticky offset u px (približno visina headera) */
  top?: number;
  /**
   * Širina jednog rail-a kao CSS dužina ili izraz.
   * Primeri: "15vw", "22%", "320px", "clamp(300px,15vw,360px)"
   *
   * Default: clamp(300px, 15vw, 360px) → min 300 (ad 300x600), raste do 360.
   */
  rail?: string;
  /** Maksimalna širina centralnog sadržaja (px). Default: 1100 */
  contentMax?: number;
  /** Razmak između kolona (Tailwind gap vrednosti). Default: 16 (gap-4) */
  gapClass?: string;
  /** Aktivni jezik stranice (sr, en, es...) */
  locale?: string;
};

/**
 * Full-bleed rails (levo/desno) + centriran glavni sadržaj.
 * - Rails su vidljivi tek od ≥lg (desktop).
 * - Širina raila je podesiva preko CSS varijable --rail.
 * - Glavni sadržaj ostaje u max širini i centriran.
 */
export default function SideRails({
  children,
  left,
  right,
  top = 96,
  rail = 'clamp(300px, 15vw, 360px)',
  contentMax = 1100,
  gapClass = 'gap-4',
  locale,
}: Props) {
  return (
    <div className="w-full">
      {/* grid sa 3 kolone: [LEFT rail][MAIN][RIGHT rail] */}
      <div
        className={`grid ${gapClass} lg:grid-cols-[var(--rail)_minmax(0,1fr)_var(--rail)]`}
        style={{ ['--rail' as any]: rail }}
      >
        {/* LEFT rail (desktop only) */}
        <aside className="hidden lg:block mt-4 md:mt-6">
          <div className="sticky" style={{ top }}>
            {left ?? <DefaultLeft locale={locale} />}
          </div>
        </aside>

        {/* MAIN (centriran i ograničen po širini) */}
        <div className="min-w-0">
          <div className="mx-auto px-4" style={{ maxWidth: contentMax }}>
            {children}
          </div>
        </div>

        {/* RIGHT rail (desktop only) */}
        <aside className="hidden lg:block mt-4 md:mt-6">
          <div className="sticky" style={{ top }}>
            {right ?? <DefaultRight />}
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ============================================================
   KONFIG: Naše aplikacije (naslov, opis, slika, link)
   ============================================================ */

const APP_CARDS = [
  {
    key: 'dreamcodex',
    img: '/images/apps/dreamcodex-hero.jpg', // proveri da je baš ovako u /public
    hrefByLocale: {
      sr: '/sr/apps/dreamcodex-ai',
      en: '/en/apps/dreamcodex-ai',
      es: '/es/apps/dreamcodex-ai',
    },
    title: {
      sr: 'DreamCodex AI',
      en: 'DreamCodex AI',
      es: 'DreamCodex AI',
    },
    desc: {
      sr: 'AI tumačenje snova sa vođenim dnevnikom i binauralnim tonovima.',
      en: 'AI dream interpreter with guided journal and binaural tones.',
      es: 'Intérprete de sueños con diario guiado y tonos binaurales.',
    },
  },
  {
    key: 'tarot',
    img: '/images/apps/ai-tarot-hero.png',
    hrefByLocale: {
      sr: '/sr/apps/ai-tarot',
      en: '/en/apps/ai-tarot',
      es: '/es/apps/ai-tarot',
    },
    title: {
      sr: 'Una Astro-Tarot AI',
      en: 'Una Astro-Tarot AI',
      es: 'Una Astro-Tarot AI',
    },
    desc: {
      sr: 'Rider–Waite AI Tarot, astrološka otvaranja i dubinska tumačenja.',
      en: 'Rider–Waite AI Tarot with deep readings and astro spreads.',
      es: 'Tarot IA Rider–Waite con lecturas profundas y tiradas astro.',
    },
  },
] as const;

type DefaultLeftProps = { locale?: string };

/**
 * Default levi rail: "Trending" + Naše aplikacije
 */
async function DefaultLeft({ locale }: DefaultLeftProps) {
  const effectiveLocale = (locale ?? 'en') as string;

  // === TRENDING: 3 najnovija članka za dati jezik ===
  const all = await getAllSlugs();
  const localeEntries = all.filter((e) => e.locale === effectiveLocale);

  const withFm = await Promise.all(
    localeEntries.map(async (e) => {
      const { frontmatter } = await loadPost(
        { locale: e.locale, category: e.category, slug: e.slug },
        { localeFallback: 'en' },
      );
      const fm: any = frontmatter;
      const rawImg = fm?.image ?? fm?.cover;
      const img = rawImg ? String(rawImg) : null;

      return { ...e, fm, img };
    }),
  );

  const latest = withFm
    .filter((e) => e.fm?.date)
    .sort(
      (a, b) =>
        new Date(b.fm.date as string).getTime() -
        new Date(a.fm.date as string).getTime(),
    )
    .slice(0, 3);

  const trendingTitle =
    effectiveLocale === 'sr'
      ? 'Trending'
      : effectiveLocale === 'es'
      ? 'Tendencias'
      : 'Trending';

  const appsTitle =
    effectiveLocale === 'sr'
      ? 'Naše aplikacije'
      : effectiveLocale === 'es'
      ? 'Nuestras apps'
      : 'Our apps';

  return (
    <div className="card-carbon p-4 text-zinc-50">
      {/* TRENDING */}
      {latest.length > 0 && (
        <>
          <div className="mb-3 text-sm font-medium text-brand-gold">
            {trendingTitle}
          </div>
          <ul className="space-y-3 text-sm">
            {latest.map((post) => {
              const href = `/${post.locale}/${post.category}/${post.slug}`;
              const postTitle = (post.fm?.title as string) ?? post.slug;

              return (
                <li key={`${post.category}/${post.slug}`}>
                  <Link href={href} className="flex items-center gap-3 group">
                    {post.img ? (
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-yellow-500/40 bg-black/40">
                        <Image
                          src={post.img}
                          alt={postTitle}
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 shrink-0 rounded-lg border border-yellow-500/40 bg-black/60 grid place-items-center text-[10px] text-yellow-400/80">
                        IH
                      </div>
                    )}

                    <span className="text-zinc-100 group-hover:text-brand-gold group-hover:underline transition-colors">
                      {postTitle}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="my-4 border-t border-yellow-500/30" />
        </>
      )}

      {/* NAŠE APLIKACIJE */}
      <div>
        <div className="mb-3 text-sm font-medium text-brand-gold">
          {appsTitle}
        </div>
        <ul className="space-y-3 text-sm">
          {APP_CARDS.map((app) => {
            const t =
              app.title[effectiveLocale as 'sr' | 'en' | 'es'] ??
              app.title.en;
            const d =
              app.desc[effectiveLocale as 'sr' | 'en' | 'es'] ?? app.desc.en;
            const href =
              app.hrefByLocale[effectiveLocale as 'sr' | 'en' | 'es'] ??
              app.hrefByLocale.en;

            return (
              <li key={app.key}>
                <Link href={href} className="flex items-center gap-3 group">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-yellow-500/40 bg-black/40">
                    {/* ovde koristimo običan <img>, bez Next/Image optimizacije */}
                    <img
                      src={app.img}
                      alt={t}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-zinc-100 group-hover:text-brand-gold transition-colors">
                      {t}
                    </div>
                    <div className="text-[11px] text-zinc-300 line-clamp-2">
                      {d}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/**
 * Default desni rail: placeholder za 300×600 oglas.
 */
function DefaultRight() {
  return (
    <div className="card-carbon p-3 text-center text-zinc-50">
      <div className="mb-2 text-sm font-medium text-zinc-200">Sponsored</div>
      {/* Slot drži standardni 300x600; ostaje responsive u užim rail-ovima */}
      <div className="mx-auto h-[600px] w-[300px] max-w-full rounded-lg border border-dashed border-zinc-600/60 grid place-items-center">
        <span className="text-xs opacity-70">Ad placeholder 300×600</span>
      </div>
      <div className="mt-2 text-xs opacity-60">Shown on desktop only</div>
    </div>
  );
}
