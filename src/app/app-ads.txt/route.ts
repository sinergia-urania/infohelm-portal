// src/app/app-ads.txt/route.ts
import { NextResponse } from 'next/server';

/**
 * app-ads.txt — verifikacija mobilnih app oglasa (npr. AdMob).
 * Kad dobiješ svoj pravi publisher ID, zameni "pub-000...".
 */
export function GET() {
  const body = [
    'google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0',
    // Dodaj po potrebi druge SSP linije
    '',
  ].join('\n');

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400', // 24h
    },
  });
}
