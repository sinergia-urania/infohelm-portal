// src/app/sitemap-news.xml/route.ts
import { NextResponse } from 'next/server';
import { listAllArticles, loadArticle } from '@/lib/content';

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tech.infohelm.org').replace(/\/+$/, '');
const LOCALES = ['en', 'es', 'sr'] as const;

type Locale = (typeof LOCALES)[number];

const PUB_NAME: Record<Locale, string> = {
  en: 'InfoHelm Tech',
  es: 'InfoHelm Tech',
  sr: 'InfoHelm Tech',
};
const PUB_LANG: Record<Locale, string> = {
  en: 'en',
  es: 'es',
  sr: 'sr',
};

export async function GET() {
  const now = Date.now();
  const cutoff = now - 7 * 24 * 60 * 60 * 1000; // 7 dana


  const all = await listAllArticles();

 
  const enriched = await Promise.all(
    all.map(async (e) => {
      try {
        const { frontmatter } = await loadArticle(e.locale, e.category, e.slug);
        const ts = frontmatter?.date ? +new Date(frontmatter.date) : 0;
        return {
          locale: e.locale as Locale,
          url: `${SITE}/${e.locale}/${e.category}/${e.slug}`,
          title: frontmatter?.title ?? e.slug,
          ts,
        };
      } catch {
        return {
          locale: e.locale as Locale,
          url: `${SITE}/${e.locale}/${e.category}/${e.slug}`,
          title: e.slug,
          ts: 0,
        };
      }
    })
  );

  const recent = enriched.filter((p) => p.ts && p.ts >= cutoff);

  // ako nema ničega u zadnjih 7 dana, uzmi bar 1 najnoviji
  const pool = recent.length ? recent : enriched.filter(p => p.ts).sort((a,b)=>b.ts-a.ts).slice(0,1);

  pool.sort((a, b) => b.ts - a.ts);
  const top = pool.slice(0, 100);


  const xmlItems = top
    .map((item) => {
      const pubDate = new Date(item.ts).toISOString(); // RFC3339
      const name = PUB_NAME[item.locale] ?? PUB_NAME.en;
      const lang = PUB_LANG[item.locale] ?? 'en';
      return `
  <url>
    <loc>${item.url}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(name)}</news:name>
        <news:language>${lang}</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escapeXml(item.title)}</news:title>
    </news:news>
  </url>`;
    })
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${xmlItems}
</urlset>`;

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=900', // 15 min
    },
  });
}

function escapeXml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

