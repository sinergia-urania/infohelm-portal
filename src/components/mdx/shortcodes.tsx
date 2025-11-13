// src/components/mdx/shortcodes.tsx
import * as React from 'react';

/** TL;DR kutija — koristi markdown kao children. */
export function TLDR({ children }: { children?: React.ReactNode }) {
  return (
    <div className="my-6 rounded-2xl border bg-white/70 p-4 dark:border-emerald-500/25 dark:bg-black/70">
      <div className="mb-2 text-xs font-semibold tracking-wider text-zinc-500 dark:text-emerald-300">
        TL;DR
      </div>
      <div className="prose prose-zinc dark:prose-invert max-w-none">{children}</div>
    </div>
  );
}

/** Pros/Cons blok sa listama u props (opciono). */
export function ProsCons({
  pros = [],
  cons = [],
  title = 'Pros & Cons',
}: {
  pros?: string[];
  cons?: string[];
  title?: string;
}) {
  return (
    <div className="my-6 rounded-2xl border p-4 bg-white/70 dark:border-emerald-500/25 dark:bg-black/70">
      <div className="mb-3 text-sm font-semibold text-zinc-700 dark:text-emerald-200">
        {title}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <ul className="space-y-1">
          {pros.map((p, i) => (
            <li key={`pro-${i}`} className="flex items-start gap-2">
              <svg className="mt-1 h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span className="text-zinc-800 dark:text-zinc-200">{p}</span>
            </li>
          ))}
          {pros.length === 0 && <li className="text-zinc-500">—</li>}
        </ul>
        <ul className="space-y-1">
          {cons.map((c, i) => (
            <li key={`con-${i}`} className="flex items-start gap-2">
              <svg className="mt-1 h-4 w-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
              <span className="text-zinc-800 dark:text-zinc-200">{c}</span>
            </li>
          ))}
          {cons.length === 0 && <li className="text-zinc-500">—</li>}
        </ul>
      </div>
    </div>
  );
}

/** Izvori — možeš proslediti items ili samo staviti markdown linkove kao children. */
export function Sources({
  items,
  children,
  title = 'Sources',
}: {
  items?: Array<{ label?: string; url: string }>;
  children?: React.ReactNode;
  title?: string;
}) {
  return (
    <div className="my-8 rounded-2xl border p-4 bg-white/70 dark:border-emerald-500/25 dark:bg-black/70">
      <div className="mb-3 text-sm font-semibold text-zinc-700 dark:text-emerald-200">
        {title}
      </div>
      {items && items.length > 0 ? (
        <ul className="list-disc pl-5 space-y-1">
          {items.map((it, i) => (
            <li key={i}>
              <a
                href={it.url}
                target="_blank"
                rel="nofollow noopener"
                className="hover:underline text-emerald-600 dark:text-emerald-300"
              >
                {it.label ?? it.url}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <div className="prose prose-zinc dark:prose-invert max-w-none">{children}</div>
      )}
    </div>
  );
}

/** SpecTable — kompaktan prikaz specifikacija.
 *
 * Možeš proslediti:
 *  - data: Record<label, value>
 *  - ili items: Array<{label, value}>
 *  - ili children (markdown) kao fallback
 *
 * Primer u .mdx:
 * <SpecTable
 *   title="Key specs"
 *   data={{ Display: "6.2\" AMOLED 120Hz", SoC: "Snapdragon 8 Gen 4", Battery: "4500 mAh" }}
 * />
 */
export function SpecTable({
  title = 'Specifications',
  data,
  items,
  children,
}: {
  title?: string;
  data?: Record<string, React.ReactNode>;
  items?: Array<{ label: string; value: React.ReactNode }>;
  children?: React.ReactNode;
}) {
  const rows: Array<{ label: string; value: React.ReactNode }> = React.useMemo(() => {
    if (items && items.length) return items;
    if (data) return Object.entries(data).map(([label, value]) => ({ label, value }));
    return [];
  }, [data, items]);

  // Ako nema rows, prikaži decu (markdown)
  if (rows.length === 0 && children) {
    return (
      <div className="my-6 rounded-2xl border p-4 bg-white/70 dark:border-emerald-500/25 dark:bg-black/70">
        <div className="mb-3 text-sm font-semibold text-zinc-700 dark:text-emerald-200">{title}</div>
        <div className="prose prose-zinc dark:prose-invert max-w-none">{children}</div>
      </div>
    );
  }

  return (
    <section className="my-6 rounded-2xl border bg-white/70 p-4 dark:border-emerald-500/25 dark:bg-black/70">
      <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-emerald-200">{title}</h3>

      <dl className="divide-y divide-zinc-200 dark:divide-emerald-500/20">
        {rows.map(({ label, value }, i) => (
          <div
            key={i}
            className="grid grid-cols-1 gap-2 py-2 sm:grid-cols-[12rem,1fr] sm:gap-6 sm:py-3"
          >
            <dt className="text-sm font-medium text-zinc-600 dark:text-emerald-300">{label}</dt>
            <dd className="text-sm text-zinc-800 dark:text-zinc-100">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
