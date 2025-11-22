// src/app/sitemap.ts
import type { MetadataRoute } from 'next';
import { getAllSlugs } from '@/lib/mdx';
import fs from 'fs/promises';
import path from 'path';

const LOCALES = ['en', 'es', 'sr'] as const;
type L = (typeof LOCALES)[number];

const rawSite = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tech.infohelm.org';
const SITE = rawSite.trim().replace(/\/+$/, ''); // ← dodali smo .trim()

const CONTENT_ROOT = path.join(process.cwd(), 'content');


// Fallback kategorije (meni redosled) — uključuje i 'apps'
const CAT_FALLBACK: string[] = [
  'news',
  'new-tech',
  'crypto-economy',
  'science-space',
  'reviews',
  'software-gaming',
  'lifestyle-entertainment',
  'apps',
];

function url(locale: L, p = '') {
  const suffix = p ? `/${p.replace(/^\/+/, '')}` : '';
  return `${SITE}/${locale}${suffix}`;
}
function mdxPath(locale: string, category: string, slug: string) {
  return path.join(CONTENT_ROOT, locale, category, `${slug}.mdx`);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const items: MetadataRoute.Sitemap = [];

  // 1) Statičke stranice po jeziku
  const staticPages = ['', 'about'];
  for (const loc of LOCALES) {
    for (const p of staticPages) {
      const languages: Record<string, string> = {
        en: url('en', p),
        es: url('es', p),
        sr: url('sr', p),
        'x-default': url('en', p),
      };
      items.push({
        url: url(loc, p),
        lastModified: now,
        changeFrequency: 'weekly',
        alternates: { languages },
      });
    }
  }

  // 2) Svi postovi iz /content
  const posts = await getAllSlugs();

  for (const e of posts) {
    // alternate jezici (isti category/slug)
    const langs: Record<string, string> = {};
    for (const l of posts) {
      if (l.category === e.category && l.slug === e.slug) {
        langs[l.locale] = url(l.locale as L, `${l.category}/${l.slug}`);
      }
    }
    langs['x-default'] = url('en', `${e.category}/${e.slug}`);

    // lastModified iz mtime MDX fajla
    let lastModified = now;
    try {
      const st = await fs.stat(mdxPath(e.locale, e.category, e.slug));
      lastModified = st.mtime ?? now;
    } catch {}

    items.push({
      url: url(e.locale as L, `${e.category}/${e.slug}`),
      lastModified,
      changeFrequency: 'daily',
      alternates: { languages: langs },
    });
  }

  // 3) Listing stranice /c/[cat] po jeziku (uključujući prazne kategorije poput 'apps')
  const catsFromPosts = Array.from(new Set(posts.map((p) => p.category)));
  const allCats = Array.from(new Set([...catsFromPosts, ...CAT_FALLBACK]));

  for (const cat of allCats) {
    for (const loc of LOCALES) {
      let lastModified = now;

      // Ako kategorija ima postove u datom jeziku — koristi najskoriji mtime,
      // inače ostavi "now" (OK je jer je listing generisani resurs).
      const inCat = posts.filter((p) => p.category === cat && p.locale === loc);
      if (inCat.length) {
        const mtimes = await Promise.all(
          inCat.map(async (p) => {
            try {
              const st = await fs.stat(mdxPath(p.locale, p.category, p.slug));
              return st.mtime?.getTime() ?? 0;
            } catch {
              return 0;
            }
          })
        );
        const max = Math.max(...mtimes);
        if (isFinite(max) && max > 0) lastModified = new Date(max);
      }

      const languages = Object.fromEntries(
        LOCALES.map((l) => [l, url(l, `c/${cat}`)])
      ) as Record<string, string>;
      (languages as any)['x-default'] = url('en', `c/${cat}`);

      items.push({
        url: url(loc, `c/${cat}`),
        lastModified,
        changeFrequency: 'daily',
        alternates: { languages },
      });
    }
  }

  return items;
}
