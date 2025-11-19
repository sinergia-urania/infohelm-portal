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
    <aside className="my-6 card-carbon p-4 text-neutral-100">
      <div className="mb-2 text-xs font-semibold tracking-wider uppercase text-yellow-400">
        {title}
      </div>
      <nav aria-label={title}>
        <ul className="space-y-1 text-sm">
          {headings.map((h) => (
            <li key={h.id} className={h.depth === 3 ? 'pl-4' : ''}>
              <a
                href={`#${h.id}`}
                className="text-yellow-400 hover:text-yellow-300 hover:underline"
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
