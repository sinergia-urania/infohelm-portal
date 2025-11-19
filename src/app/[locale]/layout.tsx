// src/app/[locale]/layout.tsx
import * as React from 'react';
import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import Script from 'next/script';
import { i18n } from '../../i18n/config';

import '../globals.css';

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import BackToTop from '../../components/BackToTop';
import SideRails from '../../components/SideRails';

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3055').replace(/\/$/, '');

// GA + Search Console konfiguracija iz env-a
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
// npr. stavi u .env.local: NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=xxx
const GOOGLE_SITE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#09090B' },
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
  ],
};

export function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!i18n.locales.includes(locale as (typeof i18n.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale as (typeof i18n.locales)[number]);
  const messages = await getMessages();

  const themeInit = `
    (function () {
      try {
        var ls = localStorage.getItem('theme');
        var wantDark = ls ? (ls === 'dark') : true;
        var doc = document.documentElement;
        if (wantDark) doc.classList.add('dark'); else doc.classList.remove('dark');
      } catch (e) {}
    })();
  `;

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* RSS per-locale */}
        <link rel="alternate" type="application/rss+xml" href={`/${locale}/feed.xml`} />
        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        {/* OpenSearch */}
        <link
          rel="search"
          type="application/opensearchdescription+xml"
          href="/opensearch.xml"
          title="InfoHelm"
        />
        {/* Manifest + Apple icon */}
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

        {/* Google Search Console verifikacija (ako postoji token) */}
        {GOOGLE_SITE_VERIFICATION && (
          <meta name="google-site-verification" content={GOOGLE_SITE_VERIFICATION} />
        )}
      </head>

      <body className="dark:bg-zinc-950 dark:text-zinc-50">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInit }}
        />

        {/* === GA4 + Consent Mode v2 (samo ako postoji NEXT_PUBLIC_GA_ID) === */}
        {GA_ID && (
          <>
            {/* GA4 loader */}
            <Script
              id="ga4"
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            />
            {/* GA4 init + Consent Mode v2 (default denied) */}
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){ dataLayer.push(arguments); }
                window.gtag = window.gtag || gtag;

                // Consent Mode v2 (default deny za sve regione — kasnije CMP može da zove __grantConsent)
                gtag('consent', 'default', {
                  ad_storage: 'denied',
                  ad_user_data: 'denied',
                  ad_personalization: 'denied',
                  analytics_storage: 'denied',
                  wait_for_update: 500
                });

                gtag('js', new Date());
                gtag('config', '${GA_ID}', { page_path: location.pathname });

                // Helper za CMP/banner — pozovi window.__grantConsent()
                window.__grantConsent = function () {
                  gtag('consent', 'update', {
                    ad_storage: 'granted',
                    ad_user_data: 'granted',
                    ad_personalization: 'granted',
                    analytics_storage: 'granted'
                  });
                  gtag('event', 'page_view', { page_path: location.pathname });
                };
              `}
            </Script>
            {/* SPA pageview-i (Next.js routing) */}
            <Script id="ga4-router" strategy="afterInteractive">
              {`
                (function () {
                  const send = () => {
                    if (!window.gtag) return;
                    const path = location.pathname + location.search + location.hash;
                    window.gtag('config', '${GA_ID}', { page_path: path });
                  };

                  ['pushState','replaceState'].forEach((type) => {
                    const orig = history[type];
                    history[type] = function () {
                      const ret = orig.apply(this, arguments);
                      window.dispatchEvent(new Event('locationchange'));
                      return ret;
                    };
                  });

                  window.addEventListener('popstate', () =>
                    window.dispatchEvent(new Event('locationchange'))
                  );
                  window.addEventListener('locationchange', send);

                  // inicijalni hit
                  send();
                })();
              `}
            </Script>
          </>
        )}

        <NextIntlClientProvider locale={locale} messages={messages}>
          <Header />
          <SideRails
            locale={locale}
            rail="clamp(300px, 15vw, 360px)"
            contentMax={1100}
            top={96}
          >
            {children}
          </SideRails>
          <Footer />
          <BackToTop />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
