// src/app/[locale]/layout.tsx
import '../globals.css'
import { NextIntlClientProvider } from 'next-intl'
import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { locales as SUPPORTED, loadMessages } from '../../../i18n'

export function generateStaticParams() {
  return SUPPORTED.map((l) => ({ locale: l }))
}

type MaybePromise<T> = T | Promise<T>
type LayoutProps = { children: ReactNode; params: MaybePromise<{ locale?: string }> }

export default async function RootLayout({ children, params }: LayoutProps) {
  const { locale: raw } = await params
  const supported = SUPPORTED as readonly string[]
  const locale = supported.includes(raw ?? '') ? (raw as string) : 'en'

  if (!supported.includes(locale)) notFound()

  // ⬇️ direktno čitamo poruke (bez getMessages => bez traženja config-a)
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
