// src/app/[locale]/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { listAllArticles, loadArticle } from '@/lib/content';

type T = {
  heroTitle: string;
  heroSubtitle: string;
  ctaPrimary: string;
  trending: string;
  latest: string;
  empty: string;
};

const TEXT: Record<string, T> = {
  en: {
    heroTitle: 'InfoHelm Tech',
    heroSubtitle: 'Navigate tech, AI & crypto with clarity.',
    ctaPrimary: 'About the portal',
    trending: 'Trending',
    latest: 'Latest posts',
    empty: 'No posts yet in this language.',
  },
  es: {
    heroTitle: 'InfoHelm Tech',
    heroSubtitle: 'Navega tecnología, IA y cripto con claridad.',
    ctaPrimary: 'Sobre el portal',
    trending: 'Tendencias',
    latest: 'Últimas publicaciones',
    empty: 'Aún no hay publicaciones en este idioma.',
  },
  sr: {
    heroTitle: 'InfoHelm Tech',
    heroSubtitle: 'Kroz tehnologiju, AI i kripto — jasno.',
    ctaPrimary: 'O portalu',
    trending: 'Trending',
    latest: 'Najnovije objave',
    empty: 'Još nema objava na ovom jeziku.',
  },
};

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.infohelm.org').replace(/\/$/, '');

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = TEXT[locale] ?? TEXT.en;
  const path = `/${locale}`;

  return {
    title: t.heroTitle,
    description: t.heroSubtitle,
    alternates: {
      canonical: `${SITE}${path}`,
      languages: { en: `${SITE}/en`, es: `${SITE}/es`, sr: `${SITE}/sr`, 'x-default': `${SITE}/en` },
    },
    openGraph: { title: t.heroTitle, description: t.heroSubtitle, url: `${SITE}${path}`, images: ['/og.jpg'] },
    twitter: { card: 'summary_large_image', title: t.heroTitle, description: t.heroSubtitle, images: ['/og.jpg'] },
  };
}

type Post = {
  url: string;
  title: string;
  description?: string;
  date?: string;
  ts: number; // za sortiranje
  category: string;
  slug: string;
};

export default async function LocaleHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = TEXT[locale] ?? TEXT.en;
  const aboutHref = `/${locale}/about`;

  // Učitaj sve članke za ovaj jezik
  const entries = (await listAllArticles()).filter((e) => e.locale === locale);
  const posts: Post[] = await Promise.all(
    entries.map(async (e) => {
      try {
        const { frontmatter } = await loadArticle(e.locale, e.category, e.slug);
        const ts = frontmatter?.date ? +new Date(frontmatter.date) : 0;
        return {
          url: `/${locale}/${e.category}/${e.slug}`,
          title: frontmatter?.title ?? e.slug,
          description: frontmatter?.description,
          date: frontmatter?.date,
          ts,
          category: e.category,
          slug: e.slug,
        };
      } catch {
        return {
          url: `/${locale}/${e.category}/${e.slug}`,
          title: e.slug,
          ts: 0,
          category: e.category,
          slug: e.slug,
        };
      }
    }),
  );

  // Najnovije prvo
  posts.sort((a, b) => b.ts - a.ts);

  const trending = posts.slice(0, 3);
  const feed = posts.slice(0, 12);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      {/* HERO — sakrij na MOBILU, prikaži od sm naviše */}
      <section className="mb-10 hidden sm:block">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{t.heroTitle}</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-300">{t.heroSubtitle}</p>
        <div className="mt-5">
          <Link
            href={aboutHref}
            className="inline-block rounded-lg px-4 py-2 bg-black text-white dark:bg-white dark:text-black hover:opacity-90"
          >
            {t.ctaPrimary}
          </Link>
        </div>
      </section>

      {posts.length === 0 ? (
        <div className="rounded-2xl border p-6 bg-white/60 dark:bg-zinc-900/60">{t.empty}</div>
      ) : (
        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Trending kutija (leva kolona) */}
          <aside className="md:col-span-1">
            <div className="rounded-2xl border bg-white/70 p-4 dark:border-emerald-500/25 dark:bg-black/70">
              <h2 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-emerald-200">{t.trending}</h2>
              <ul className="space-y-2">
                {trending.map((p) => (
                  <li key={p.url}>
                    <Link href={p.url} className="hover:underline text-emerald-600 dark:text-emerald-300">
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Glavni feed (desne 2 kolone) */}
          <div className="md:col-span-2">
            <h2 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-emerald-200">{t.latest}</h2>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {feed.map((p) => {
                const dt =
                  p.date &&
                  new Date(p.date).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
                return (
                  <li key={p.url} className="rounded-xl border p-4 bg-white/70 dark:bg-zinc-900/60">
                    <h3 className="text-lg font-semibold">
                      <Link href={p.url} className="hover:underline text-emerald-600 dark:text-emerald-300">
                        {p.title}
                      </Link>
                    </h3>
                    {dt ? <p className="mt-1 text-sm text-zinc-500">{dt}</p> : null}
                    {p.description ? (
                      <p className="mt-2 text-zinc-700 dark:text-zinc-300">{p.description}</p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}
