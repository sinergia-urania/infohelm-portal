// src/app/[locale]/layout.tsx
import '../globals.css'
import { NextIntlClientProvider } from 'next-intl'
import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { locales as SUPPORTED, loadMessages } from '../../../i18n'

// ❗ Onemogući SSG/ISR za ovaj segment → nema prerendera u buildu
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

// važno: NEMA generateStaticParams ovde

type MaybePromise<T> = T | Promise<T>
type LayoutProps = { children: ReactNode; params: MaybePromise<{ locale?: string }> }

export default async function RootLayout({ children, params }: LayoutProps) {
  const { locale: raw } = await params
  const supported = SUPPORTED as readonly string[]
  const locale = supported.includes(raw ?? '') ? (raw as string) : 'en'

  if (!supported.includes(locale)) notFound()

  // direktno učitavanje poruka (zaobilazi getMessages/pronalaženje configa u prerenderu)
  const messages = await loadMessages(locale)

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
