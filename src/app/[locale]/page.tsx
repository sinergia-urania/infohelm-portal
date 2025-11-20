// src/app/[locale]/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
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

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tech.infohelm.org').replace(
  /\/$/,
  '',
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = TEXT[locale] ?? TEXT.en;
  const path = `/${locale}`;

  return {
    title: t.heroTitle,
    description: t.heroSubtitle,
    alternates: {
      canonical: `${SITE}${path}`,
      languages: {
        en: `${SITE}/en`,
        es: `${SITE}/es`,
        sr: `${SITE}/sr`,
        'x-default': `${SITE}/en`,
      },
    },
    openGraph: {
      title: t.heroTitle,
      description: t.heroSubtitle,
      url: `${SITE}${path}`,
      images: ['/og.jpg'],
    },
    twitter: {
      card: 'summary_large_image',
      title: t.heroTitle,
      description: t.heroSubtitle,
      images: ['/og.jpg'],
    },
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
  image?: string; // thumbnail (image ili cover iz frontmatter-a)
};

export default async function LocaleHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = TEXT[locale] ?? TEXT.en;
  const aboutHref = `/${locale}/about`;

  // sr → koristi latinicu za datume, ostali jezici ostaju isti
  const dateLocale = locale === 'sr' || locale === 'sr-RS' ? 'sr-Latn-RS' : locale;

  // Učitaj sve članke za ovaj jezik
  const entries = (await listAllArticles()).filter((e) => e.locale === locale);
  const posts: Post[] = await Promise.all(
    entries.map(async (e) => {
      try {
        const { frontmatter } = await loadArticle(e.locale, e.category, e.slug);
        const ts = frontmatter?.date ? +new Date(frontmatter.date) : 0;
        const image: string | undefined =
          frontmatter?.image ?? frontmatter?.cover ?? undefined;

        return {
          url: `/${locale}/${e.category}/${e.slug}`,
          title: frontmatter?.title ?? e.slug,
          description: frontmatter?.description,
          date: frontmatter?.date,
          ts,
          category: e.category,
          slug: e.slug,
          image,
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
  const appsPosts = posts.filter((p) => p.category === 'apps').slice(0, 2);

  const appsTitle =
    locale === 'sr'
      ? 'Naše aplikacije'
      : locale === 'es'
      ? 'Nuestras apps'
      : 'Our apps';

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      {/* HERO — sakrij na MOBILU, prikaži od sm naviše */}
      <section className="mb-10 hidden sm:block">
        <h1 className="gold-heading text-3xl sm:text-4xl font-bold tracking-tight">
          {t.heroTitle}
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-300">{t.heroSubtitle}</p>
        <div className="mt-5">
          <Link
            href={aboutHref}
            className="inline-block rounded-lg bg-black px-4 py-2 text-white hover:opacity-90 dark:bg-white dark:text-black"
          >
            {t.ctaPrimary}
          </Link>
        </div>
      </section>

      {posts.length === 0 ? (
        <div className="rounded-2xl border bg-white/60 p-6 dark:bg-zinc-900/60">
          {t.empty}
        </div>
      ) : (
        <>
          {/* GRID: Trending + Latest posts */}
          <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Trending kutija (leva kolona) */}
            <aside className="md:col-span-1">
              <div className="card-carbon p-4 text-zinc-50">
                <h2 className="mb-3 text-sm font-semibold text-brand-gold">
                  {t.trending}
                </h2>
                <ul className="space-y-3">
                  {trending.map((p) => (
                    <li key={p.url}>
                      <Link
                        href={p.url}
                        className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-yellow-500/5"
                      >
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-yellow-500/40 bg-black/40">
                          <Image
                            src={p.image ?? '/og.jpg'}
                            alt={p.title}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </div>
                        <span className="line-clamp-2 text-sm leading-snug text-zinc-100">
                          {p.title}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Glavni feed (desne 2 kolone) */}
            <div className="md:col-span-2">
              <h2 className="mb-3 text-sm font-semibold text-brand-gold">
                {t.latest}
              </h2>
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {feed.map((p) => {
                  const dt =
                    p.date &&
                    new Date(p.date).toLocaleDateString(dateLocale, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    });

                  return (
                    <li
                      key={p.url}
                      className="card-carbon group p-4 text-zinc-50 transition duration-150 hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      {/* Naslov */}
                      <h3 className="text-lg font-semibold">
                        <Link
                          href={p.url}
                          className="text-brand-gold transition-colors hover:text-yellow-300 hover:underline"
                        >
                          {p.title}
                        </Link>
                      </h3>

                      {/* Datum */}
                      {dt ? (
                        <p className="mt-1 text-sm text-zinc-400">{dt}</p>
                      ) : null}

                      {/* Slika ispod naslova */}
                      <div className="relative mt-3 h-32 w-full overflow-hidden rounded-xl border border-yellow-500/30 bg-black/40">
                        <Image
                          src={p.image ?? '/og.jpg'}
                          alt={p.title}
                          fill
                          sizes="(min-width: 768px) 50vw, 100vw"
                          className="object-cover"
                        />
                      </div>

                      {/* Opis */}
                      {p.description ? (
                        <p className="mt-3 text-sm text-zinc-200 line-clamp-3">
                          {p.description}
                        </p>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>

          {/* Naše aplikacije — samo mobil, ispod Latest posts */}
          {appsPosts.length > 0 && (
            <section className="mt-8 md:hidden">
              <div className="card-carbon p-4 text-zinc-50">
                <h2 className="mb-3 text-sm font-semibold text-brand-gold">
                  {appsTitle}
                </h2>
                <ul className="space-y-3">
                  {appsPosts.map((ap) => {
                    const cover = ap.image ?? '/og.jpg';
                    return (
                      <li key={ap.url}>
                        <Link
                          href={ap.url}
                          className="flex gap-3 rounded-xl p-2 transition-colors hover:bg-yellow-500/5"
                        >
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-yellow-500/40 bg-black/40">
                            <Image
                              src={cover}
                              alt={ap.title}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-zinc-50 line-clamp-2">
                              {ap.title}
                            </p>
                            {ap.description && (
                              <p className="mt-1 text-xs text-zinc-300 line-clamp-2">
                                {ap.description}
                              </p>
                            )}
                          </div>
                        </Link>
                      </li>
                  );
                  })}
                </ul>
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}
