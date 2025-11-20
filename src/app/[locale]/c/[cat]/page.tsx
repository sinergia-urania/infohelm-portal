// src/app/[locale]/c/[cat]/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { listAllArticles, loadArticle } from '@/lib/content';

type CatDef = {
  slug: string;
  title: { en: string; es: string; sr: string };
  description: { en: string; es: string; sr: string };
};

// Centralno definiši kategorije (redosled = meni redosled)
const CATS: CatDef[] = [
  {
    slug: 'news',
    title: { en: 'News', es: 'Novedades', sr: 'Novosti' },
    description: {
      en: 'Daily highlights across tech, AI, crypto, markets.',
      es: 'Lo más destacado diario de tecnología, IA, cripto y mercados.',
      sr: 'Dnevni presjek: tehnologija, AI, kripto i berze.',
    },
  },
  {
    slug: 'new-tech',
    title: { en: 'New Technologies', es: 'Nuevas tecnologías', sr: 'Nove tehnologije' },
    description: {
      en: 'Breakthroughs in AI, quantum, chips, robotics and more.',
      es: 'Avances en IA, cuántica, chips, robótica y más.',
      sr: 'Proboji u AI, kvantnim računarima, čipovima, robotici i dr.',
    },
  },
  {
    slug: 'crypto-economy',
    title: { en: 'Crypto & Economy', es: 'Cripto y economía', sr: 'Kripto i ekonomija' },
    description: {
      en: 'Crypto markets, stocks, macro trends and on-chain metrics.',
      es: 'Mercados cripto, acciones, macro y métricas on-chain.',
      sr: 'Kripto tržišta, akcije, makro trendovi i on-chain metrike.',
    },
  },
  {
    slug: 'science-space',
    title: { en: 'Science & Space', es: 'Ciencia y espacio', sr: 'Nauka i svemir' },
    description: {
      en: 'New discoveries, space missions and deep science stories.',
      es: 'Nuevos descubrimientos, misiones espaciales y ciencia.',
      sr: 'Nova otkrića, svemirske misije i ozbiljna nauka.',
    },
  },
  {
    slug: 'reviews',
    title: { en: 'Device Reviews', es: 'Reseñas de dispositivos', sr: 'Recenzije uređaja' },
    description: {
      en: 'Phones, laptops, wearables and practical buying advice.',
      es: 'Móviles, portátiles, wearables y consejos de compra.',
      sr: 'Telefoni, laptopovi, satovi i praktični savjeti za kupovinu.',
    },
  },
  {
    slug: 'software-gaming',
    title: { en: 'Software & Gaming', es: 'Software y gaming', sr: 'Softver i gejming' },
    description: {
      en: 'Apps, tools, OS updates and the gaming scene.',
      es: 'Apps, herramientas, actualizaciones y gaming.',
      sr: 'Aplikacije, alati, OS novosti i gejming scena.',
    },
  },
  {
    slug: 'lifestyle-entertainment',
    title: {
      en: 'Lifestyle & Entertainment',
      es: 'Estilo de vida y entretenimiento',
      sr: 'Lifestyle i zabava',
    },
    description: {
      en: 'Culture, trends, weekly horoscope and fun picks.',
      es: 'Cultura, tendencias, horóscopo semanal y ocio.',
      sr: 'Kultura, trendovi, nedeljni horoskop i zabava.',
    },
  },
  {
    slug: 'apps',
    title: { en: 'Apps', es: 'Aplicaciones', sr: 'Aplikacije' },
    description: {
      en: 'Our mobile apps (AI Tarot, DreamCodex)—news, updates and guides.',
      es: 'Nuestras apps móviles (AI Tarot, DreamCodex): noticias y guías.',
      sr: 'Naše mobilne aplikacije (AI Tarot, DreamCodex) — vesti, najave i vodiči.',
    },
  },
];

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tech.infohelm.org').replace(/\/$/, '');

function getCat(slug: string) {
  return CATS.find((c) => c.slug === slug);
}

export async function generateStaticParams() {
  const LOCALES = ['en', 'es', 'sr'] as const;
  return LOCALES.flatMap((locale) => CATS.map((c) => ({ locale, cat: c.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; cat: string }>;
}): Promise<Metadata> {
  const { locale, cat } = await params;
  const def = getCat(cat);
  if (!def) return { title: 'Not found' };

  const title = def.title[locale as 'en' | 'es' | 'sr'] ?? def.title.en;
  const description = def.description[locale as 'en' | 'es' | 'sr'] ?? def.description.en;
  const url = `${SITE}/${locale}/c/${def.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: `${SITE}/en/c/${def.slug}`,
        es: `${SITE}/es/c/${def.slug}`,
        sr: `${SITE}/sr/c/${def.slug}`,
        'x-default': `${SITE}/en/c/${def.slug}`,
      },
      // ✅ RSS feed hint za OVU kategoriju i jezik
      types: { 'application/rss+xml': `${SITE}/${locale}/c/${def.slug}/feed.xml` },
    },
    openGraph: { title, description, url, images: ['/og.png'] },
    twitter: { card: 'summary_large_image', title, description, images: ['/og.png'] },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; cat: string }>;
}) {
  const { locale, cat } = await params;
  const def = getCat(cat);
  if (!def) return notFound();

  const title = def.title[locale as 'en' | 'es' | 'sr'] ?? def.title.en;
  const description = def.description[locale as 'en' | 'es' | 'sr'] ?? def.description.en;

  // === Učitaj članke za ovu kategoriju/locale ===
  const entries = (await listAllArticles()).filter(
    (e) => e.locale === locale && e.category === cat,
  );

  const posts = await Promise.all(
    entries.map(async (e) => {
      const { frontmatter } = await loadArticle(e.locale, e.category, e.slug);
      return { ...e, frontmatter };
    }),
  );

  // Sortiraj po datumu opadajuće (ako postoji)
  posts.sort((a, b) => {
    const da = a.frontmatter?.date ? +new Date(a.frontmatter.date) : 0;
    const db = b.frontmatter?.date ? +new Date(b.frontmatter.date) : 0;
    return db - da;
  });

  return (
  <main className="mx-auto max-w-6xl px-4 pt-12 pb-10">
    {/* Breadcrumbs kao chip */}
    <nav className="mb-4">
      <div className="breadcrumb-chip">
        <Link href={`/${locale}`} className="hover:underline">
          {locale === 'sr' ? 'Početna' : locale === 'es' ? 'Inicio' : 'Home'}
        </Link>
        <span className="mx-2">·</span>
        <span>{title}</span>
      </div>
    </nav>

    <h1 className="gold-heading text-2xl sm:text-3xl font-bold tracking-tight">
      {title}
    </h1>
    <p className="about-body mt-2 leading-relaxed text-sm sm:text-base">
      {description}
    </p>

    {/* RSS badge/link */}

      <div className="mt-3">
        <Link
          href={`/${locale}/c/${cat}/feed.xml`}
          prefetch={false}
          className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm
                     border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10
                     dark:text-emerald-300"
        >
          {/* mali RSS ikon */}
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <circle cx="6" cy="18" r="2" fill="currentColor" />
            <path d="M5 11a7 7 0 0 1 7 7" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M5 6a12 12 0 0 1 12 12" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
          RSS
        </Link>
      </div>

      {/* Lista članaka sa thumbnail-om */}
      {posts.length > 0 ? (
        <ul className="mt-8 space-y-4">
          {posts.map(({ slug, frontmatter }) => {
            const url = `/${locale}/${cat}/${slug}`;
            const dt = frontmatter?.date
              ? new Date(frontmatter.date).toLocaleDateString(locale, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : null;
            const img = (frontmatter as any)?.image ?? (frontmatter as any)?.cover;
            const thumb = img ? String(img) : null;

              

            return (
              <li
                key={slug}
                className="group card-carbon p-4 sm:p-5 transition duration-150 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={frontmatter?.title ?? slug}
                      width={96}
                      height={96}
                      className="h-24 w-24 flex-none rounded-lg object-cover ring-1 ring-zinc-200 dark:ring-zinc-700"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-24 w-24 flex-none rounded-lg ring-1 ring-zinc-200 dark:ring-zinc-700 bg-zinc-100 dark:bg-zinc-800 grid place-items-center text-xs text-zinc-500">
                      no image
                    </div>
                  )}

                  {/* Tekst */}
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-semibold">
                      <Link
                        href={url}
                        className="text-brand-gold transition-colors hover:text-yellow-300 hover:underline"
                      >
                        {frontmatter?.title ?? slug}
                      </Link>
                    </h2>
                    {dt ? (
                      <p className="mt-1 text-sm text-zinc-400">
                        {dt}
                      </p>
                    ) : null}
                    {frontmatter?.description ? (
                      <p className="mt-2 text-zinc-200 line-clamp-2">
                        {frontmatter.description}
                      </p>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-8 card-carbon p-6">
          <p className="text-sm text-zinc-200">
            {locale === 'sr'
              ? 'Ovde će uskoro biti najnoviji članci iz ove kategorije.'
              : locale === 'es'
              ? 'Aquí pronto verás las últimas publicaciones de esta categoría.'
              : 'Latest posts in this category will appear here soon.'}
          </p>
        </div>
      )}
    </main>
  );
}
