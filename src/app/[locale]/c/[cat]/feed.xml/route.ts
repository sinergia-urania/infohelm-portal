import { NextRequest } from 'next/server';
import { listAllArticles, loadArticle } from '@/lib/content';
import { buildRssXML } from '@/lib/rss';

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tech.infohelm.org').replace(/\/+$/, '');

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ locale: string; cat: string }> }
) {
  const { locale = 'en', cat = 'news' } = await context.params;


  // Učitaj sve članke u datoj kategoriji/jeziku
  const all = (await listAllArticles()).filter(e => e.locale === locale && e.category === cat);

  // Front-matter → RSS itemi
  const items = await Promise.all(all.map(async e => {
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
  }));

  items.sort((a: any, b: any) => (b.ts ?? 0) - (a.ts ?? 0));
  const top = items.slice(0, 50).map(({ ts, ...rest }) => rest);

  const TITLES: Record<string, { title: string; desc: string }> = {
    en: { title: `InfoHelm Tech — ${cat} feed`, desc: `Latest in ${cat}.` },
    es: { title: `InfoHelm Tech — ${cat} feed`, desc: `Lo último en ${cat}.` },
    sr: { title: `InfoHelm Tech — ${cat} feed`, desc: `Najnovije u ${cat}.` },
  };
  const meta = TITLES[locale] ?? TITLES.en;

  const xml = buildRssXML({
    title: meta.title,
    description: meta.desc,
    siteUrl: SITE,
    feedUrl: `${SITE}/${locale}/c/${cat}/feed.xml`,
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
