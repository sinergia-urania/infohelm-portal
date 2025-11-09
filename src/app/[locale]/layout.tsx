// src/app/[locale]/layout.tsx
import '../globals.css'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'es' }, { locale: 'sr' }]
}

const SUPPORTED = ['en', 'es', 'sr'] as const
type Locale = typeof SUPPORTED[number]

// Next 16: params ponekad izgleda kao Promise — zato await
type MaybePromise<T> = T | Promise<T>
type LayoutProps = {
  children: ReactNode
  params: MaybePromise<{ locale?: string }>
}

export default async function RootLayout({ children, params }: LayoutProps) {
  const { locale: raw } = await params
  const locale: Locale = SUPPORTED.includes(raw as Locale) ? (raw as Locale) : 'en'

  if (!SUPPORTED.includes(locale)) notFound()

  // next-intl čita locale iz i18n/middleware; ovde samo povučemo poruke
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
