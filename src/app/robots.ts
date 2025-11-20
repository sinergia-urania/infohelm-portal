// src/app/robots.ts
import type {MetadataRoute} from 'next';

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tech.infohelm.org').replace(/\/$/, '');

export default function robots(): MetadataRoute.Robots {
  return {
    host: SITE,
    sitemap: `${SITE}/sitemap.xml`,
    rules: [
      { userAgent: '*', allow: '/' }
    ]
  };
}
