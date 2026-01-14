// src/app/ads.txt/route.ts
import { NextResponse } from 'next/server';

export function GET() {
  const lines = [
    "google.com, pub-2786609619751533, DIRECT, f08c47fec0942fa0",
  ].join("\n");

  return new NextResponse(lines, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
