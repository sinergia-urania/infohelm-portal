import '../globals.css'
import {NextIntlClientProvider} from 'next-intl'
import {ReactNode} from 'react'
import {notFound} from 'next/navigation'

export function generateStaticParams() {
  return [{locale:'en'},{locale:'es'},{locale:'sr'}]
}

// statična mapa ka TS modulima (bez JSON import problema)
const dictionaries = {
  en: () => import('../../lib/i18n/messages/en').then(m => m.default),
  es: () => import('../../lib/i18n/messages/es').then(m => m.default),
  sr: () => import('../../lib/i18n/messages/sr').then(m => m.default)
} as const

export default async function RootLayout({
  children,
  params: { locale }
}: {
  children: ReactNode
  params: { locale: 'en' | 'es' | 'sr' }
}) {
  if (!['en','es','sr'].includes(locale)) notFound()
  const messages = (await dictionaries[locale]()) // fallback ti više ni ne treba

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
