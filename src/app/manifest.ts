// src/app/manifest.ts
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'InfoHelm Tech',
    short_name: 'InfoHelm',
    description: 'Mobile-first tech • AI • crypto portal.',
    id: '/?source=pwa',
    start_url: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#000000',
    theme_color: '#000000',
    categories: ['news', 'technology', 'ai', 'science'],
    // ⬇️ RELATIVNE putanje (rade i lokalno i na produkciji)
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
