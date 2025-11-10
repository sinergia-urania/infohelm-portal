'use client'

import { useTranslations } from 'next-intl'

export default function AboutPage() {
  const t = useTranslations('about')

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <p className="mt-2 opacity-90">{t('description')}</p>
    </main>
  )
}
