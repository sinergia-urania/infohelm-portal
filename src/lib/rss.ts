// src/lib/rss.ts
export type RssItem = {
  title: string;
  url: string;                 // apsolutni URL
  description?: string;
  date?: string;               // ISO
  author?: string;
  categories?: string[];
};

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function buildRssXML(opts: {
  title: string;
  description?: string;
  siteUrl: string;             // bez kosih na kraju
  feedUrl: string;             // apsolutni URL ovog feeda
  language: string;            // <— ranije 'en' | 'es' | 'sr'
  items: RssItem[];
}) {
  const { title, description = '', siteUrl, feedUrl, language, items } = opts;
  const now = new Date().toUTCString();

  const channel = `<channel>
  <title>${esc(title)}</title>
  <link>${siteUrl}</link>
  <description>${esc(description)}</description>
  <language>${language}</language>
  <lastBuildDate>${now}</lastBuildDate>
  <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
  ${items
    .map((i) => {
      const pub = i.date ? new Date(i.date).toUTCString() : now;
      const cats = (i.categories ?? [])
        .map((c) => `<category>${esc(c)}</category>`)
        .join('');
      const author = i.author ? `<author>${esc(i.author)}</author>` : '';
      const desc = i.description
        ? `<description><![CDATA[${i.description}]]></description>`
        : '<description><![CDATA[]]></description>';
      return `<item>
  <title>${esc(i.title)}</title>
  <link>${i.url}</link>
  <guid isPermaLink="true">${i.url}</guid>
  ${desc}
  <pubDate>${pub}</pubDate>
  ${author}
  ${cats}
</item>`;
    })
    .join('\n')}
</channel>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
${channel}
</rss>`;
}
