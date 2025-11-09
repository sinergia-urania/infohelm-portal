'use client'
import {useTranslations} from 'next-intl'

export default function Home() {
  const t = useTranslations('home')
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <p className="mt-2 opacity-90">{t('tagline')}</p>
      <div className="mt-6 grid gap-3">
        <a className="underline" href="/en">/en</a>
        <a className="underline" href="/es">/es</a>
        <a className="underline" href="/sr">/sr</a>
      </div>
    </main>
  )
}
