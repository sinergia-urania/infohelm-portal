// src/app/[locale]/[category]/[slug]/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { loadPost, getAllSlugs } from '@/lib/mdx';
import SeoJsonLd from '@/components/SeoJsonLd';

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.infohelm.org').replace(/\/+$/, '');

type RouteParams = { locale?: unknown; category?: unknown; slug?: unknown };
const asStr = (v: unknown) => (typeof v === 'string' ? v : String(v ?? ''));

// Lokalizovani nazivi kategorija (isti slugovi kao u headeru)
const CAT_LABELS: Record<string, { en: string; es: string; sr: string }> = {
  'news':                    { en: 'News',                 es: 'Novedades',                     sr: 'Novosti' },
  'new-tech':                { en: 'New Technologies',     es: 'Nuevas tecnologías',            sr: 'Nove tehnologije' },
  'crypto-economy':          { en: 'Crypto & Economy',     es: 'Cripto y economía',             sr: 'Kripto i ekonomija' },
  'science-space':           { en: 'Science & Space',      es: 'Ciencia y espacio',             sr: 'Nauka i svemir' },
  'reviews':                 { en: 'Device Reviews',       es: 'Reseñas de dispositivos',       sr: 'Recenzije uređaja' },
  'software-gaming':         { en: 'Software & Gaming',    es: 'Software y gaming',             sr: 'Softver i gejming' },
  'lifestyle-entertainment': { en: 'Lifestyle & Entertainment', es: 'Estilo de vida y entretenimiento', sr: 'Lifestyle i zabava' }
};
const HOME_LABEL: Record<string, string> = { en: 'Home', es: 'Inicio', sr: 'Početna' };
const TOC_TITLE: Record<string, string> = { en: 'On this page', es: 'En esta página', sr: 'Na ovoj strani' };

export async function generateStaticParams() {
  const entries = await getAllSlugs();
  return entries.map(({ locale, category, slug }) => ({ locale, category, slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<RouteParams> }
): Promise<Metadata> {
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
      ? (String(img).startsWith('http') ? String(img) : `${SITE}${String(img)}`)
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
      openGraph: { title, description, url, siteName: 'InfoHelm', type: 'article', images: [coverAbs] },
      twitter: { card: 'summary_large_image', title, description, images: [coverAbs] }
    };
  } catch {
    notFound();
  }
}

export default async function ArticlePage(
  { params }: { params: Promise<RouteParams> }
) {
  const p = await params; // Next 16: params je Promise
  const locale = asStr(p.locale);
  const category = asStr(p.category);
  const slug = asStr(p.slug);

  try {
    const { Content, frontmatter, headings } = await loadPost({ locale, category, slug }, { localeFallback: 'en' });

    const url = `${SITE}/${locale}/${category}/${slug}`;
    const fm: any = frontmatter;
    const schemaType =
      fm?.type === 'review'
        ? 'Review'
        : fm?.type === 'news'
        ? 'NewsArticle'
        : 'Article';

    const img = fm?.image ?? fm?.cover;
    const coverAbs = img
      ? (String(img).startsWith('http') ? String(img) : `${SITE}${String(img)}`)
      : `${SITE}/og.jpg`;

    const catLabel =
      CAT_LABELS[category]?.[locale as 'en' | 'es' | 'sr'] ??
      CAT_LABELS[category]?.en ??
      category;

    // Breadcrumbs za UI i JSON-LD
    const breadcrumbs = [
      { name: HOME_LABEL[locale] ?? HOME_LABEL.en, url: `/${locale}` },
      { name: catLabel, url: `/${locale}/c/${category}` },
      { name: frontmatter.title ?? slug, url: `/${locale}/${category}/${slug}` }
    ];

    // === Related posts (po tagovima + kategoriji; fallback: najnoviji iz iste kategorije) ===
    const all = await getAllSlugs();
    const tagSet = new Set<string>((fm?.tags as string[] | undefined) ?? []);

    const candidates = all.filter(
      (e) => e.locale === locale && !(e.category === category && e.slug === slug)
    );

    const withFm = await Promise.all(
      candidates.map(async (e) => {
        const { frontmatter: fmx } = await loadPost(
          { locale: e.locale, category: e.category, slug: e.slug },
          { localeFallback: 'en' }
        );
        return { ...e, fm: fmx as any };
      })
    );

    const scored = withFm.map((e) => {
      const t: string[] = (e.fm?.tags as string[] | undefined) ?? [];
      const overlap = t.reduce((acc, x) => acc + (tagSet.has(x) ? 1 : 0), 0);
      const base = e.category === category ? 1 : 0;
      const date = e.fm?.date ? new Date(e.fm.date).getTime() : 0;
      return { ...e, score: overlap * 10 + base, date };
    });

    let related = scored
      .filter((s) => s.score > 0)
      .sort((a, b) => (b.score - a.score) || (b.date - a.date))
      .slice(0, 4);

    // Fallback ako nema tag overlapa: uzmi najnovije iz iste kategorije
    if (related.length === 0) {
      related = scored
        .filter((s) => s.category === category)
        .sort((a, b) => b.date - a.date)
        .slice(0, 4);
    }

    // ToC render helper
    const toc = Array.isArray(headings) ? headings.filter(h => h.title && (h.depth === 2 || h.depth === 3)) : [];
    const tocTitle = TOC_TITLE[locale] ?? TOC_TITLE.en;

    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        {/* UI Breadcrumbs */}
        <nav className="mb-4 text-sm text-zinc-600 dark:text-zinc-300">
          <Link href={`/${locale}`} className="underline">{HOME_LABEL[locale] ?? HOME_LABEL.en}</Link>
          <span className="mx-2">·</span>
          <Link href={`/${locale}/c/${category}`} className="underline">{catLabel}</Link>
        </nav>

        <header className="mb-6">
          <h1 className="text-3xl font-semibold">{frontmatter.title}</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-300">
            {frontmatter.author ?? 'InfoHelm Team'}
            {frontmatter.date ? (
              <>
                <span className="mx-2">·</span>
                <time dateTime={frontmatter.date}>
                  {new Date(frontmatter.date).toLocaleDateString(locale, {
                    year: 'numeric', month: 'short', day: 'numeric'
                  })}
                </time>
              </>
            ) : null}
          </p>
        </header>

        {/* ToC (mobile collapsible) */}
        {toc.length >= 2 && (
          <details className="lg:hidden mb-6 rounded-xl border p-4 bg-white/70 dark:bg-zinc-900/60">
            <summary className="cursor-pointer font-medium">{tocTitle}</summary>
            <nav className="mt-3" aria-label={tocTitle}>
              <ul className="space-y-1">
                {toc.map(h => (
                  <li key={h.id} className={h.depth === 3 ? 'pl-4' : ''}>
                    <a href={`#${h.id}`} className="hover:underline text-emerald-700 dark:text-emerald-300">
                      {h.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </details>
        )}

        {/* Dvokolonski raspored: content + sticky ToC */}
        <div className="grid gap-8 lg:grid-cols-[1fr,280px]">
          <article className="prose prose-zinc dark:prose-invert max-w-none">
            {/* MDX sadržaj je već React element */}
            {Content}
          </article>

          {/* ToC (desktop sticky) */}
          {toc.length >= 2 && (
            <aside className="hidden lg:block sticky top-24 h-fit rounded-xl border p-4 bg-white/70 dark:bg-zinc-900/60">
              <div className="mb-2 text-xs font-semibold tracking-wider text-zinc-500 dark:text-zinc-400">
                {tocTitle}
              </div>
              <nav aria-label={tocTitle}>
                <ul className="space-y-1">
                  {toc.map(h => (
                    <li key={h.id} className={h.depth === 3 ? 'pl-4' : ''}>
                      <a href={`#${h.id}`} className="hover:underline text-emerald-700 dark:text-emerald-300">
                        {h.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          )}
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-semibold">
              {locale === 'sr' ? 'Povezane objave'
               : locale === 'es' ? 'Publicaciones relacionadas'
               : 'Related posts'}
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {related.map((r) => {
                const href = `/${locale}/${r.category}/${r.slug}`;
                const dt = r.fm?.date
                  ? new Date(r.fm.date).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' })
                  : null;
                return (
                  <li key={`${r.category}/${r.slug}`} className="rounded-xl border p-4 bg-white/70 dark:bg-zinc-900/60">
                    <h3 className="text-base font-semibold">
                      <Link href={href} className="hover:underline text-emerald-600 dark:text-emerald-300">
                        {r.fm?.title ?? r.slug}
                      </Link>
                    </h3>
                    {dt ? <p className="mt-1 text-sm text-zinc-500">{dt}</p> : null}
                    {r.fm?.description ? (
                      <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{r.fm.description}</p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <SeoJsonLd
          type={schemaType as any}
          locale={['en','es','sr'].includes(locale) ? (locale as 'en'|'es'|'sr') : 'en'}
          url={url}
          title={frontmatter.title}
          description={frontmatter.description}
          datePublished={frontmatter.date}
          dateModified={frontmatter.date}
          authorName={frontmatter.author ?? 'InfoHelm Team'}
          images={[coverAbs]}
          section={category}
          tags={frontmatter.tags ?? []}
          breadcrumbs={breadcrumbs}
          {...(schemaType === 'Review'
            ? { rating: fm?.rating, itemReviewed: frontmatter.title ? { name: frontmatter.title } : undefined }
            : {})}
        />
      </main>
    );
  } catch {
    notFound();
  }
}
