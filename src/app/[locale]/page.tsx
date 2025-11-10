'use client'
import Link from 'next/link'
import {useTranslations} from 'next-intl'

export default function Home() {
  const t = useTranslations('home')
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <p className="mt-2 opacity-90">{t('tagline')}</p>
      <div className="mt-6 grid gap-3">
        <Link className="underline" href="/en">
          /en
        </Link>
        <Link className="underline" href="/es">
          /es
        </Link>
        <Link className="underline" href="/sr">
          /sr
        </Link>
      </div>
    </main>
  )
}
