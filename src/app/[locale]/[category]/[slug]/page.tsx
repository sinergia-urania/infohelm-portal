// src/app/[locale]/[category]/[slug]/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { loadPost, getAllSlugs } from '@/lib/mdx';
import SeoJsonLd from '@/components/SeoJsonLd';

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.infohelm.org').replace(
  /\/+$/,
  '',
);

type RouteParams = { locale?: unknown; category?: unknown; slug?: unknown };
const asStr = (v: unknown) => (typeof v === 'string' ? v : String(v ?? ''));

// Lokalizovani nazivi kategorija (isti slugovi kao u headeru)
const CAT_LABELS: Record<string, { en: string; es: string; sr: string }> = {
  news: { en: 'News', es: 'Novedades', sr: 'Novosti' },
  'new-tech': { en: 'New Technologies', es: 'Nuevas tecnologías', sr: 'Nove tehnologije' },
  'crypto-economy': { en: 'Crypto & Economy', es: 'Cripto y economía', sr: 'Kripto i ekonomija' },
  'science-space': { en: 'Science & Space', es: 'Ciencia y espacio', sr: 'Nauka i svemir' },
  reviews: { en: 'Device Reviews', es: 'Reseñas de dispositivos', sr: 'Recenzije uređaja' },
  'software-gaming': { en: 'Software & Gaming', es: 'Software y gaming', sr: 'Softver i gejming' },
  'lifestyle-entertainment': {
    en: 'Lifestyle & Entertainment',
    es: 'Estilo de vida y entretenimiento',
    sr: 'Lifestyle i zabava',
  },
  apps: {
    en: 'Apps',
    es: 'Aplicaciones',
    sr: 'Aplikacije',
  },
};

const HOME_LABEL: Record<string, string> = { en: 'Home', es: 'Inicio', sr: 'Početna' };
const TOC_TITLE: Record<string, string> = {
  en: 'On this page',
  es: 'En esta página',
  sr: 'Na ovoj strani',
};

// Naslov za share sekciju
const SHARE_TITLE: Record<string, string> = {
  en: 'Share this article',
  es: 'Compartir este artículo',
  sr: 'Podeli članak',
};

export async function generateStaticParams() {
  const entries = await getAllSlugs();
  return entries.map(({ locale, category, slug }) => ({ locale, category, slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const p = await params; // Next 16: params je Promise
  const locale = asStr(p.locale);
  const category = asStr(p.category);
  const slug = asStr(p.slug);

  try {
    const { frontmatter } = await loadPost({ locale, category, slug }, { localeFallback: 'en' });

    const url = `${SITE}/${locale}/${category}/${slug}`;
    const title = frontmatter.title ?? slug;
    const description = frontmatter.description ?? '';

    const img = (frontmatter as any).image ?? (frontmatter as any).cover;
    const coverAbs = img
      ? String(img).startsWith('http')
        ? String(img)
        : `${SITE}${String(img)}`
      : `${SITE}/og.jpg`;

    // alternates.languages za dostupne jezike istog sluga
    const all = await getAllSlugs();
    const languages: Record<string, string> = {};
    for (const e of all) {
      if (e.category === category && e.slug === slug) {
        languages[e.locale] = `${SITE}/${e.locale}/${category}/${slug}`;
      }
    }
    // x-default → EN
    (languages as any)['x-default'] = `${SITE}/en/${category}/${slug}`;

    return {
      title,
      description,
      alternates: { canonical: url, languages },
      openGraph: {
        title,
        description,
        url,
        siteName: 'InfoHelm',
        type: 'article',
        images: [coverAbs],
      },
      twitter: { card: 'summary_large_image', title, description, images: [coverAbs] },
    };
  } catch {
    notFound();
  }
}

export default async function ArticlePage({ params }: { params: Promise<RouteParams> }) {
  const p = await params; // Next 16: params je Promise
  const locale = asStr(p.locale);
  const categoryFromRoute = asStr(p.category);
  const slug = asStr(p.slug);

  // Datumi za sr → latinica
  const dateLocale = locale === 'sr' || locale === 'sr-RS' ? 'sr-Latn-RS' : locale;

  try {
    const { Content, frontmatter, headings } = await loadPost(
      { locale, category: categoryFromRoute, slug },
      { localeFallback: 'en' },
    );

    const fm: any = frontmatter;

    // Kanonski category slug – ako je definisan u frontmatteru, koristimo njega
    const category = (fm?.category as string) || categoryFromRoute;

    const url = `${SITE}/${locale}/${category}/${slug}`;

    const schemaType =
      fm?.type === 'review' ? 'Review' : fm?.type === 'news' ? 'NewsArticle' : 'Article';

    const img = fm?.image ?? fm?.cover;
    const coverAbs = img
      ? String(img).startsWith('http')
        ? String(img)
        : `${SITE}${String(img)}`
      : `${SITE}/og.jpg`;

    const catLabel =
      CAT_LABELS[category]?.[locale as 'en' | 'es' | 'sr'] ?? CAT_LABELS[category]?.en ?? category;

    // Breadcrumbs za UI i JSON-LD
    const breadcrumbs = [
      { name: HOME_LABEL[locale] ?? HOME_LABEL.en, url: `/${locale}` },
      { name: catLabel, url: `/${locale}/c/${category}` },
      { name: frontmatter.title ?? slug, url: `/${locale}/${category}/${slug}` },
    ];

    // === Related posts (po tagovima + kategoriji; fallback: najnoviji iz iste kategorije) ===
    const all = await getAllSlugs();
    const tagSet = new Set<string>((fm?.tags as string[] | undefined) ?? []);

    const candidates = all.filter(
      (e) => e.locale === locale && !(e.category === category && e.slug === slug),
    );

    const withFm = await Promise.all(
      candidates.map(async (e) => {
        const { frontmatter: fmx } = await loadPost(
          { locale: e.locale, category: e.category, slug: e.slug },
          { localeFallback: 'en' },
        );
        return { ...e, fm: fmx as any };
      }),
    );

    const scored = withFm.map((e) => {
      const t: string[] = (e.fm?.tags as string[] | undefined) ?? [];
      const overlap = t.reduce((acc, x) => acc + (tagSet.has(x) ? 1 : 0), 0);
      const base = e.category === category ? 1 : 0;
      const date = e.fm?.date ? new Date(e.fm.date).getTime() : 0;
      return { ...e, score: overlap * 10 + base, date };
    });

    // *** Naše aplikacije (apps kategorija) – koristimo iste podatke ***
    const appsPosts = scored
      .filter((s) => s.category === 'apps')
      .sort((a, b) => b.date - a.date)
      .slice(0, 2); // npr. najnovije dve app stranice

    let related = scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score || b.date - a.date)
      .slice(0, 4);

    // Fallback ako nema tag overlapa: uzmi najnovije iz iste kategorije
    if (related.length === 0) {
      related = scored
        .filter((s) => s.category === category)
        .sort((a, b) => b.date - a.date)
        .slice(0, 4);
    }

    // ToC render helper
    const toc = Array.isArray(headings)
      ? headings.filter((h) => h.title && (h.depth === 2 || h.depth === 3))
      : [];
    const tocTitle = TOC_TITLE[locale] ?? TOC_TITLE.en;

    // Share linkovi (Facebook / X / LinkedIn)
    const shareTitle = SHARE_TITLE[locale] ?? SHARE_TITLE.en;
    const shareTextBase = frontmatter.title ? `${frontmatter.title} — InfoHelm` : 'InfoHelm Tech';
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(shareTextBase);

    const shareLinks = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedText}`,
    };

    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        {/* UI Breadcrumbs – sada kao "chip" sa carbon trakom u light modu */}
        <nav className="mb-4 breadcrumb-chip">
          <Link href={`/${locale}`} className="hover:underline">
            {HOME_LABEL[locale] ?? HOME_LABEL.en}
          </Link>
          <span className="mx-2">·</span>
          <Link href={`/${locale}/c/${category}`} className="hover:underline">
            {catLabel}
          </Link>
        </nav>

        <header className="mb-6">
          <h1 className="text-3xl font-semibold">{frontmatter.title}</h1>

          {/* Autor + datum – meta-chip (zlato u dark, carbon + zlato u light) */}
          <p className="mt-2 meta-chip">
            {frontmatter.author ?? 'InfoHelm Team'}
            {frontmatter.date ? (
              <>
                <span className="mx-2">·</span>
                <time dateTime={frontmatter.date}>
                  {new Date(frontmatter.date).toLocaleDateString(dateLocale, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </time>
              </>
            ) : null}
          </p>
        </header>

        {/* Dvokolonski raspored: content + sticky ToC */}
        <div className="grid gap-8 lg:grid-cols-[1fr,280px]">
          {/* LEVA kolona: tekst + share bar */}
          <div>
            <article className="article-body prose prose-zinc dark:prose-invert mx-auto max-w-3xl">
              {/* MDX sadržaj je već React element */}
              {Content}
            </article>

            {/* SHARE sekcija ispod teksta */}
            <section className="mt-8 border-t border-yellow-500/30 pt-4">
              <h2 className="mb-3 text-xs font-semibold tracking-wider uppercase text-brand-gold">
                {shareTitle}
              </h2>
              <div className="flex flex-wrap gap-2 text-sm">
                <a
                  href={shareLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-yellow-500/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-yellow-300 hover:bg-yellow-500/10 transition-colors"
                >
                  <span className="text-base leading-none">f</span>
                  <span>Facebook</span>
                </a>
                <a
                  href={shareLinks.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-yellow-500/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-yellow-300 hover:bg-yellow-500/10 transition-colors"
                >
                  <span className="text-base leading-none">𝕏</span>
                  <span>X / Twitter</span>
                </a>
                <a
                  href={shareLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-yellow-500/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-yellow-300 hover:bg-yellow-500/10 transition-colors"
                >
                  <span className="text-base leading-none">in</span>
                  <span>LinkedIn</span>
                </a>
              </div>
            </section>

            {/* Naše aplikacije – mobile only, uvek posle share sekcije */}
            {appsPosts.length > 0 && (
              <section className="mt-8 lg:hidden card-carbon p-4 text-zinc-50">
                <h2 className="mb-3 text-sm font-semibold text-brand-gold">
                  {locale === 'sr'
                    ? 'Naše aplikacije'
                    : locale === 'es'
                    ? 'Nuestras apps'
                    : 'Our apps'}
                </h2>
                <ul className="space-y-3">
                  {appsPosts.map((ap) => {
                    const href = `/${locale}/${ap.category}/${ap.slug}`;
                    const cover =
                      ap.fm?.image ??
                      ap.fm?.cover ??
                      '/images/apps/app-placeholder.jpg';
                    const title = ap.fm?.title ?? ap.slug;
                    const desc = ap.fm?.description ?? '';

                    return (
                      <li key={`${ap.category}/${ap.slug}`}>
                        <Link
                          href={href}
                          className="flex gap-3 rounded-xl p-2 transition-colors hover:bg-yellow-500/5"
                        >
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-yellow-500/40 bg-black/40">
                            <Image
                              src={cover}
                              alt={title}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-zinc-50 line-clamp-2">
                              {title}
                            </p>
                            {desc && (
                              <p className="mt-1 text-xs text-zinc-300 line-clamp-2">
                                {desc}
                              </p>
                            )}
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
          </div>

          {/* ToC (desktop sticky) */}
          {toc.length >= 2 && (
            <aside className="hidden lg:block sticky top-24 h-fit card-carbon p-4 text-neutral-100">
              <div className="mb-2 text-xs font-semibold tracking-wider uppercase text-yellow-400">
                {tocTitle}
              </div>
              <nav aria-label={tocTitle}>
                <ul className="space-y-1 text-sm">
                  {toc.map((h) => (
                    <li key={h.id} className={h.depth === 3 ? 'pl-4' : ''}>
                      <a
                        href={`#${h.id}`}
                        className="text-yellow-400 hover:text-yellow-300 hover:underline"
                      >
                        {h.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          )}
        </div>

        {/* ToC (mobile collapsible) */}
        {toc.length >= 2 && (
          <details className="lg:hidden mt-8 mb-6 card-carbon p-4 text-neutral-100">
            <summary className="cursor-pointer text-xs font-semibold tracking-wider uppercase text-yellow-400">
              {tocTitle}
            </summary>
            <nav className="mt-3" aria-label={tocTitle}>
              <ul className="space-y-1 text-sm">
                {toc.map((h) => (
                  <li key={h.id} className={h.depth === 3 ? 'pl-4' : ''}>
                    <a
                      href={`#${h.id}`}
                      className="text-yellow-400 hover:text-yellow-300 hover:underline"
                    >
                      {h.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </details>
        )}

        {/* Related posts sa slikom */}
        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-semibold">
              {locale === 'sr'
                ? 'Povezane objave'
                : locale === 'es'
                ? 'Publicaciones relacionadas'
                : 'Related posts'}
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {related.map((r) => {
                const catSlug = (r.fm?.category as string) || r.category;
                const href = `/${locale}/${catSlug}/${r.slug}`;
                const dt = r.fm?.date
                  ? new Date(r.fm.date).toLocaleDateString(dateLocale, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : null;
                const cover = r.fm?.image ?? r.fm?.cover ?? '/images/og.jpg';

                return (
                  <li
                    key={`${r.category}/${r.slug}`}
                    className="group card-carbon p-3 transition duration-150 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <Link href={href} className="flex gap-3">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-yellow-500/40">
                        <Image
                          src={cover}
                          alt={r.fm?.title ?? r.slug}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-yellow-400 group-hover:text-yellow-300 group-hover:underline transition-colors">
                          {r.fm?.title ?? r.slug}
                        </h3>
                        {dt ? (
                          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-400">
                            {dt}
                          </p>
                        ) : null}
                        {r.fm?.description ? (
                          <p className="mt-1 text-sm text-zinc-100 dark:text-zinc-100 line-clamp-2">
                            {r.fm.description}
                          </p>
                        ) : null}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <SeoJsonLd
          type={schemaType as any}
          locale={['en', 'es', 'sr'].includes(locale) ? (locale as 'en' | 'es' | 'sr') : 'en'}
          url={url}
          title={frontmatter.title}
          description={frontmatter.description}
          datePublished={frontmatter.date}
          dateModified={frontmatter.date}
          authorName={frontmatter.author ?? 'InfoHelm Team'}
          images={[coverAbs]}
          section={category}
          tags={frontmatter.tags ?? []}
          {...(schemaType === 'Review'
            ? {
                rating: fm?.rating,
                itemReviewed: frontmatter.title ? { name: frontmatter.title } : undefined,
              }
            : {})}
        />
      </main>
    );
  } catch {
    notFound();
  }
}
