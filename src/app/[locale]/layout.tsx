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

// GA + Search Console konfiguracija
const GA_ID = 'G-0KVNXW0YPH' as const;

const GOOGLE_SITE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
};

// 👇 Umesto OS-based themeColor, forsiramo tamnu traku (default dark UX)
export const viewport: Viewport = {
  themeColor: '#000000',
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

  // 🌓 Init teme:
  // - default = DARK (kad nema localStorage zapisa)
  // - ako je localStorage.theme === 'light', onda skidamo dark
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
        {/* Init teme pre React-a */}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInit }}
        />

        {/* === GA4 – osnovna varijanta (bez Consent Mode-a i router haka) === */}
        {GA_ID && (
          <>
            {/* Loader */}
            <Script
              id="ga4"
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            />
            {/* Init */}
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = window.gtag || gtag;

                gtag('js', new Date());
                gtag('config', '${GA_ID}', {
                  page_path: window.location.pathname + window.location.search,
                });
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
