// src/app/[locale]/feed.xml/route.ts
import { NextRequest } from 'next/server';
import { listAllArticles, loadArticle } from '@/lib/content';
import { buildRssXML } from '@/lib/rss';

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tech.infohelm.org').replace(/\/+$/, '');

const TITLES: Record<string, { title: string; desc: string }> = {
  en: { title: 'InfoHelm Tech — Latest', desc: 'Latest posts: tech, AI, crypto, science & reviews.' },
  es: { title: 'InfoHelm Tech — Novedades', desc: 'Últimas publicaciones: tecnología, IA, cripto, ciencia y reseñas.' },
  sr: { title: 'InfoHelm Tech — Najnovije', desc: 'Najnovije objave: tehnologija, AI, kripto, nauka i recenzije.' },
};

type LocaleKey = keyof typeof TITLES; // "en" | "es" | "sr"

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ locale: string }> }
) {
  // params je Promise → await
  const { locale: rawLocale = 'en' } = await context.params;

  // Normalizuj na podržane jezike, da TS zna da je union "en" | "es" | "sr"
  const locale: LocaleKey =
    rawLocale === 'es' || rawLocale === 'sr' ? (rawLocale as LocaleKey) : 'en';

  // Učitaj sve članke za ovaj jezik
  const all = (await listAllArticles()).filter((e) => e.locale === locale);

  // Dohvati front-matter i napravi apsolutne URL-ove
  const items = await Promise.all(
    all.map(async (e) => {
      try {
        const { frontmatter } = await loadArticle(e.locale, e.category, e.slug);
        return {
          title: frontmatter?.title ?? e.slug,
          url: `${SITE}/${e.locale}/${e.category}/${e.slug}`,
          description: frontmatter?.description ?? '',
          date: frontmatter?.date,
          author: frontmatter?.author ?? 'InfoHelm Team',
          categories: frontmatter?.tags ?? [],
          ts: frontmatter?.date ? +new Date(frontmatter.date) : 0,
        };
      } catch {
        return {
          title: e.slug,
          url: `${SITE}/${e.locale}/${e.category}/${e.slug}`,
          description: '',
          ts: 0,
        };
      }
    })
  );

  // Sortiraj najnovije → najstarije i skrati
  items.sort((a: any, b: any) => (b.ts ?? 0) - (a.ts ?? 0));
  const top = items.slice(0, 50).map(({ ts, ...rest }) => rest);

  const meta = TITLES[locale] ?? TITLES.en;

  const xml = buildRssXML({
    title: meta.title,
    description: meta.desc,
    siteUrl: SITE,
    feedUrl: `${SITE}/${locale}/feed.xml`,
    language: locale,
    items: top,
  });

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
    },
  });
}
