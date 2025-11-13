// File: src/lib/mdx.tsx
import 'server-only';
import fs from 'fs/promises';
import path from 'path';
import { compileMDX } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import type { ReactElement } from 'react';

// Shortcodes — jedinstvena verzija (bez duplikata stilova)
import { TLDR, ProsCons, SpecTable, Sources } from '@/components/mdx/shortcodes';
// ➕ NEW: Affiliate kutija kao MDX komponent
import AffiliateBox from '@/components/mdx/AffiliateBox';

// ——— Tipovi front-matter polja koja očekujemo ———
export type FrontMatter = {
  title: string;
  description?: string;
  date?: string;        // ISO string
  author?: string;
  tags?: string[];
  tldr?: string;
  canonical?: string;
  image?: string;       // OG
  draft?: boolean;
};

export type PostId = {
  locale: string;
  category: string;
  slug: string;
};

// ToC/Headings
export type Heading = {
  id: string;
  title: string;
  depth: 2 | 3;
};

const CONTENT_ROOT = path.join(process.cwd(), 'content');

// ——— MDX komponente (mapiranje) ———
export const mdxComponents = {
  TLDR,
  ProsCons,
  SpecTable,
  Sources,
  AffiliateBox,        // ⬅️ dodato
  ABox: AffiliateBox,  // ⬅️ opcioni alias kraći za MDX (<ABox ... />)
} as const;

// ——— Helpers ———
function mdxPath({ locale, category, slug }: PostId) {
  return path.join(CONTENT_ROOT, locale, category, `${slug}.mdx`);
}

async function fileExists(p: string) {
  try { await fs.access(p); return true; } catch { return false; }
}

// Minimalni slugify za id (bez novih depova)
function simpleSlug(s: string) {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')      // skidanje dijakritika
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// HAST util: rekurzivni tekst iz noda
function nodeText(n: any): string {
  if (!n) return '';
  if (n.type === 'text') return String(n.value ?? '');
  if (Array.isArray(n.children)) return n.children.map(nodeText).join('');
  return '';
}

// HAST util: DFS šetnja
function walk(n: any, cb: (node: any) => void) {
  cb(n);
  if (n && Array.isArray(n.children)) {
    for (const c of n.children) walk(c, cb);
  }
}

// Rehype plugin (bez eksternih paketa): prikupi h2/h3 u `bucket`
function rehypeCollectHeadings(bucket: Heading[]) {
  return () => (tree: any) => {
    walk(tree, (node) => {
      if (node?.type === 'element' && (node.tagName === 'h2' || node.tagName === 'h3')) {
        const title = nodeText(node).trim();
        if (!title) return;
        let id = node.properties?.id as string | undefined;
        if (!id) {
          id = simpleSlug(title);
          node.properties = { ...(node.properties || {}), id };
        }
        bucket.push({ id, title, depth: node.tagName === 'h2' ? 2 : 3 });
      }
    });
  };
}

// ——— Glavni API ———
export async function loadPost(
  params: PostId,
  opts?: { localeFallback?: string }
): Promise<{
  Content: ReactElement;
  frontmatter: FrontMatter;
  usedPath: string;
  headings: Heading[];
}> {
  const primary = mdxPath(params);
  let usePath = primary;

  if (!(await fileExists(primary)) && opts?.localeFallback) {
    const fb = mdxPath({ ...params, locale: opts.localeFallback });
    if (await fileExists(fb)) usePath = fb;
  }

  const source = await fs.readFile(usePath, 'utf8');
  const headingsBucket: Heading[] = [];

  // compileMDX će parsirati front-matter (parseFrontmatter: true)
  const { content, frontmatter } = await compileMDX<FrontMatter>({
    source,
    components: mdxComponents as any,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,                 // generiše id-ove iz naslova
          rehypeCollectHeadings(headingsBucket) // pokupi h2/h3 u bucket
        ],
      },
    },
  });

  return {
    Content: content as unknown as ReactElement, // React element spreman za render
    frontmatter,
    usedPath: usePath,
    headings: headingsBucket,
  };
}

export async function listCategory(locale: string, category: string) {
  const dir = path.join(CONTENT_ROOT, locale, category);
  let entries: string[] = [];
  try {
    entries = (await fs.readdir(dir)).filter(f => f.endsWith('.mdx'));
  } catch {
    return [];
  }

  // Vrati minimalne meta podatke za listing
  const items = await Promise.all(entries.map(async file => {
    const full = path.join(dir, file);
    const raw = await fs.readFile(full, 'utf8');
    const { frontmatter } = await compileMDX<FrontMatter>({
      source: raw,
      options: { parseFrontmatter: true },
    });
    const slug = file.replace(/\.mdx$/, '');
    return {
      slug,
      locale,
      category,
      title: frontmatter.title ?? slug,
      description: frontmatter.description ?? '',
      date: frontmatter.date ?? null,
      tags: frontmatter.tags ?? [],
    };
  }));

  // Sortiraj po datumu opadajuće (null na kraj)
  items.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
  return items;
}

export async function getAllSlugs() {
  let locales: string[] = [];
  try { locales = await fs.readdir(CONTENT_ROOT); } catch { return []; }

  const results: PostId[] = [];
  for (const locale of locales) {
    const locDir = path.join(CONTENT_ROOT, locale);
    const cats = (await fs.readdir(locDir, { withFileTypes: true })).filter(d => d.isDirectory()).map(d => d.name);
    for (const category of cats) {
      const catDir = path.join(locDir, category);
      const files = (await fs.readdir(catDir)).filter(f => f.endsWith('.mdx'));
      for (const f of files) {
        results.push({ locale, category, slug: f.replace(/\.mdx$/, '') });
      }
    }
  }
  return results;
}
