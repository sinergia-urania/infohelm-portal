// src/components/mdx/AffiliateBox.tsx
import React from "react";

type Props = {
  title: string;
  href: string;
  image?: string;          // /images/… ili pun URL
  description?: string;
  cta?: string;            // npr. "View on Google Play"
  price?: string;          // opcionalno
  rating?: number;         // 0–5, prikaz ★★★★☆
  merchant?: string;       // npr. "Google Play", "Amazon"
  note?: string;           // mala napomena ispod (npr. "Affiliate link")
};

function Stars({ value = 0 }: { value?: number }) {
  const v = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <span aria-label={`${v} of 5`}>
      {"★★★★★".slice(0, v)}
      <span className="opacity-40">{"★★★★★".slice(v)}</span>
    </span>
  );
}

export default function AffiliateBox({
  title,
  href,
  image,
  description,
  cta = "Check price",
  price,
  rating,
  merchant,
  note,
}: Props) {
  return (
    <div
      className="my-6 overflow-hidden rounded-2xl border
                 bg-white/70 dark:bg-black/70
                 border-zinc-200 dark:border-emerald-500/25"
    >
      <div className="flex flex-col sm:flex-row gap-4 p-4">
        {/* Slika */}
        <div className="sm:w-40 sm:flex-none grid place-items-center">
          {image ? (
            <img
              src={image}
              alt={title}
              className="h-28 w-28 object-cover rounded-lg ring-1 ring-zinc-200 dark:ring-zinc-800"
              loading="lazy"
            />
          ) : (
            <div className="h-28 w-28 rounded-lg grid place-items-center text-xs
                            bg-zinc-100 dark:bg-zinc-900 ring-1 ring-zinc-200 dark:ring-zinc-800">
              no image
            </div>
          )}
        </div>

        {/* Tekst */}
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold">{title}</h3>
          {merchant ? (
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{merchant}</p>
          ) : null}
          {description ? (
            <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{description}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            {typeof rating === "number" ? (
              <span className="text-amber-400"><Stars value={rating} /></span>
            ) : null}
            {price ? (
              <span className="rounded-full border px-2 py-0.5
                               border-zinc-200 dark:border-emerald-500/30
                               text-zinc-700 dark:text-emerald-200">
                {price}
              </span>
            ) : null}
          </div>
        </div>

        {/* CTA */}
        <div className="sm:w-48 sm:flex-none">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-flex w-full items-center justify-center rounded-lg px-4 py-2
                       border border-zinc-300 dark:border-emerald-500/30
                       text-zinc-800 dark:text-emerald-200
                       hover:bg-zinc-100 dark:hover:bg-emerald-500/10"
          >
            {cta}
          </a>
          {note ? (
            <p className="mt-2 text-[11px] leading-snug text-zinc-500 dark:text-zinc-400">{note}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
