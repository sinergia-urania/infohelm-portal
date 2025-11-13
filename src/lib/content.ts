// src/lib/content.ts
import fs from 'fs/promises';
import path from 'path';
import { compileMDX } from 'next-mdx-remote/rsc';
import { notFound } from 'next/navigation';

export type ArticleFrontmatter = {
  title: string;
  description?: string;
  date?: string;
  author?: string;
  tags?: string[];
  // hero slika – podržavamo i "cover" i "image" iz front-mattera
  cover?: string;
  image?: string;
  type?: 'article' | 'news' | 'review';
  rating?: {
    ratingValue: number;
    best?: number;
    worst?: number;
    reviewCount?: number;
  };
};

const CONTENT_DIR = path.join(process.cwd(), 'content');

// ⬇️ helper: robustan join (stringifikacija + skip null/undefined)
function joinSafe(...parts: Array<string | number | null | undefined>) {
  const sanitized = parts
    .filter((p) => p !== undefined && p !== null)
    .map((p) => String(p));
  return path.join(...sanitized);
}

export async function listAllArticles(): Promise<
  { locale: string; category: string; slug: string }[]
> {
  const res: { locale: string; category: string; slug: string }[] = [];
  let locales: string[];
  try {
    locales = await fs.readdir(CONTENT_DIR);
  } catch {
    return res;
  }

  for (const locale of locales) {
    const locDir = joinSafe(CONTENT_DIR, locale);
    let cats: string[];
    try {
      const stats = await fs.stat(locDir);
      if (!stats.isDirectory()) continue;
      cats = await fs.readdir(locDir);
    } catch {
      continue;
    }

    for (const category of cats) {
      const catDir = joinSafe(locDir, category);
      let files: string[];
      try {
        const stats = await fs.stat(catDir);
        if (!stats.isDirectory()) continue;
        files = await fs.readdir(catDir);
      } catch {
        continue;
      }

      for (const file of files) {
        if (!file.endsWith('.mdx')) continue;
        const slug = file.replace(/\.mdx$/, '');
        res.push({ locale, category, slug });
      }
    }
  }

  return res;
}

export async function getArticleSource(
  locale: string,
  category: string,
  slug: string
): Promise<string | null> {
  // primarni path
  const fullPath = joinSafe(CONTENT_DIR, locale, category, `${slug}.mdx`);
  try {
    const src = await fs.readFile(fullPath, 'utf8');
    return src;
  } catch {
    // fallback: category lowercase (ako je u URL-u drugačije)
    try {
      const fp2 = joinSafe(
        CONTENT_DIR,
        String(locale),
        String(category).toLowerCase(),
        `${String(slug)}.mdx`
      );
      if (fp2 !== fullPath) {
        const src2 = await fs.readFile(fp2, 'utf8');
        return src2;
      }
    } catch {}
    return null;
  }
}

/**
 * Učitaj MDX (RSC-friendly), vrati React sadržaj + front-matter.
 */
export async function loadArticle(
  locale: string,
  category: string,
  slug: string
): Promise<{ content: React.ReactNode; frontmatter: ArticleFrontmatter }> {
  const source = await getArticleSource(locale, category, slug);
  if (!source) notFound();

  const { content, frontmatter } = await compileMDX<ArticleFrontmatter>({
    source,
    options: {
      parseFrontmatter: true,
      mdxOptions: { remarkPlugins: [], rehypePlugins: [] }
    }
  });

  // normalizacija – ako u MDX-u piše "image", puni se i cover
  const fm: ArticleFrontmatter = {
    title: frontmatter.title,
    description: frontmatter.description ?? '',
    date: frontmatter.date,
    author: frontmatter.author ?? 'InfoHelm Team',
    tags: frontmatter.tags ?? [],
    cover: frontmatter.cover ?? frontmatter.image,
    image: frontmatter.image ?? frontmatter.cover,
    type: frontmatter.type ?? 'article',
    rating: frontmatter.rating
  };

  return { content, frontmatter: fm };
}
