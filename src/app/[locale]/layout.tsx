// src/app/[locale]/layout.tsx
import '../globals.css'
import { NextIntlClientProvider } from 'next-intl'
import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { locales as SUPPORTED } from '../../../i18n'

// ❗ Onemogući SSG/ISR za ovaj segment → nema prerendera u buildu
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

// važno: NEMA generateStaticParams ovde

type LayoutProps = { children: ReactNode; params: { locale?: string } }

export default async function RootLayout({ children, params }: LayoutProps) {
  const { locale: raw } = params
  const supported = SUPPORTED as readonly string[]

  if (!raw || !supported.includes(raw)) {
    notFound()
  }

  const locale = raw as string

  setRequestLocale(locale)

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
