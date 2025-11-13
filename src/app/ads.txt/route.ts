// src/app/ads.txt/route.ts
import { NextResponse } from 'next/server';

/**
 * ads.txt — dodaj svoj stvarni publisher ID kad ga dobiješ (pub-XXXXXXXXXXXXXXX).
 * Google ovde mora stajati ovako: "google.com, pub-..., DIRECT, f08c47fec0942fa0".
 * Do tada placeholder može stajati (nije problem).
 */
export function GET() {
  const lines = [
    'google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0',
    // Dodaj druge SSP-ove ovde po potrebi (Amazon UAM, Index, itd.)
    '',
  ].join('\n');

  return new NextResponse(lines, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400', // 24h
    },
  });
}
