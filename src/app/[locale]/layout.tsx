import '../globals.css'
import {NextIntlClientProvider} from 'next-intl'
import {ReactNode} from 'react'
import {notFound} from 'next/navigation'

export function generateStaticParams() {
  return [{locale:'en'},{locale:'es'},{locale:'sr'}]
}

async function getMessages(locale: string) {
  try { return (await import(`@/lib/i18n/messages/${locale}.json`)).default }
  catch { return (await import('@/lib/i18n/messages/en.json')).default }
}

export default async function RootLayout({
  children, params:{locale}
}: {children: ReactNode, params:{locale: string}}) {
  if (!['en','es','sr'].includes(locale)) notFound()
  const messages = await getMessages(locale)

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
