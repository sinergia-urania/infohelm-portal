// src/components/ToC.tsx
'use client';
import * as React from 'react';

type Heading = { id: string; title: string; depth: 2 | 3 };

export default function ToC({
  headings,
  title = 'On this page',
}: {
  headings: Heading[];
  title?: string;
}) {
  if (!headings || headings.length < 2) return null;

  return (
    <aside className="my-6 rounded-2xl border p-4 bg-white/70 dark:border-emerald-500/25 dark:bg-black/70">
      <div className="mb-2 text-xs font-semibold tracking-wider text-zinc-500 dark:text-emerald-300">
        {title}
      </div>
      <nav>
        <ul className="space-y-1 text-sm">
          {headings.map((h) => (
            <li key={h.id} className={h.depth === 3 ? 'pl-4' : ''}>
              <a
                href={`#${h.id}`}
                className="hover:underline text-emerald-700 dark:text-emerald-300"
              >
                {h.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
