// src/components/SideRails.tsx
import * as React from 'react';

type Props = {
  children: React.ReactNode;
  left?: React.ReactNode;
  right?: React.ReactNode;
  /** Sticky offset u px (približno visina headera) */
  top?: number;
  /**
   * Širina jednog rail-a kao CSS dužina ili izraz.
   * Primeri: "15vw", "22%", "320px", "clamp(300px,15vw,360px)"
   *
   * Default: clamp(300px, 15vw, 360px) → min 300 (ad 300x600), raste do 360.
   */
  rail?: string;
  /** Maksimalna širina centralnog sadržaja (px). Default: 1100 */
  contentMax?: number;
  /** Razmak između kolona (Tailwind gap vrednosti). Default: 16 (gap-4) */
  gapClass?: string;
};

/**
 * Full-bleed rails (levo/desno) + centriran glavni sadržaj.
 * - Rails su vidljivi tek od ≥lg (desktop).
 * - Širina raila je podesiva preko CSS varijable --rail.
 * - Glavni sadržaj ostaje u max širini i centriran.
 */
export default function SideRails({
  children,
  left,
  right,
  top = 96,
  rail = 'clamp(300px, 15vw, 360px)',
  contentMax = 1100,
  gapClass = 'gap-4',
}: Props) {
  return (
    <div className="w-full">
      {/* grid sa 3 kolone: [LEFT rail][MAIN][RIGHT rail] */}
      <div
        className={`grid ${gapClass} lg:grid-cols-[var(--rail)_minmax(0,1fr)_var(--rail)]`}
        style={{ ['--rail' as any]: rail }}
      >
        {/* LEFT rail (desktop only) */}
        <aside className="hidden lg:block">
          <div className="sticky" style={{ top }}>
            {left ?? <DefaultLeft />}
          </div>
        </aside>

        {/* MAIN (centriran i ograničen po širini) */}
        <div className="min-w-0">
          <div className="mx-auto px-4" style={{ maxWidth: contentMax }}>
            {children}
          </div>
        </div>

        {/* RIGHT rail (desktop only) */}
        <aside className="hidden lg:block">
          <div className="sticky" style={{ top }}>
            {right ?? <DefaultRight />}
          </div>
        </aside>
      </div>
    </div>
  );
}

function DefaultLeft() {
  return (
    <div className="rounded-xl border p-3">
      <div className="mb-2 text-sm font-medium opacity-70">Trending</div>
      <ul className="space-y-2 text-sm">
        <li>
          <a className="underline" href="#">
            AI: Top 5 research picks
          </a>
        </li>
        <li>
          <a className="underline" href="#">
            Bitcoin on-chain flows this week
          </a>
        </li>
        <li>
          <a className="underline" href="#">
            S25 camera tests: early results
          </a>
        </li>
      </ul>
    </div>
  );
}

function DefaultRight() {
  return (
    <div className="rounded-xl border p-3 text-center">
      <div className="text-sm font-medium opacity-70 mb-2">Sponsored</div>
      {/* Slot drži standardni 300x600; ostaje responsive u užim rail-ovima */}
      <div className="mx-auto h-[600px] w-[300px] max-w-full rounded-lg border border-dashed grid place-items-center">
        <span className="text-xs opacity-60">Ad placeholder 300×600</span>
      </div>
      <div className="mt-2 text-xs opacity-60">Shown on desktop only</div>
    </div>
  );
}
