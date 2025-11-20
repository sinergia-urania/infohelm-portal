// src/app/[locale]/about/page.tsx
import Link from 'next/link';
import type { Metadata } from 'next';
import SeoJsonLd from '@/components/SeoJsonLd';

type Locale = 'en' | 'es' | 'sr';

const SITE =
  (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tech.infohelm.org').replace(/\/+$/, '');

const LOCALES: Locale[] = ['en', 'es', 'sr'];

const TEXT = {
  en: {
    title: 'About InfoHelm',
    desc: 'InfoHelm turns complex tech, AI & crypto topics into clear, actionable insights.',
    back: 'Back to Home',
    disclosureTitle: 'Disclosure',
    d1: 'Some articles include affiliate links. If you click and buy, we may earn a small commission at no extra cost to you.',
    d2: 'Recommendations are independent and based on usefulness for readers. Compensation does not influence our editorial verdicts.',
    d3: 'We use analytics to understand traffic and improve the site. Personal data is not sold. Consent for analytics/ads can be changed at any time.',
  },
  es: {
    title: 'Acerca de InfoHelm',
    desc: 'InfoHelm convierte temas complejos en ideas claras y accionables.',
    back: 'Volver al inicio',
    disclosureTitle: 'Divulgación',
    d1: 'Algunos artículos incluyen enlaces de afiliados. Si compras tras hacer clic, podemos recibir una pequeña comisión sin coste adicional para ti.',
    d2: 'Nuestras recomendaciones son independientes y se basan en la utilidad para los lectores. La compensación no influye en el veredicto editorial.',
    d3: 'Usamos analíticas para entender el tráfico y mejorar el sitio. No vendemos datos personales. El consentimiento para analíticas/anuncios puede cambiarse en cualquier momento.',
  },
  sr: {
    title: 'O InfoHelm portalu',
    desc: 'InfoHelm prevodi složene teme iz tehnologije, AI i kripta u jasne korake.',
    back: 'Nazad na početnu',
    disclosureTitle: 'Obaveštenje',
    d1: 'Pojedini tekstovi sadrže affiliate linkove. Ako klikneš i obaviš kupovinu, možemo dobiti malu proviziju bez dodatnog troška za tebe.',
    d2: 'Preporuke su nezavisne i zasnovane na korisnosti za čitaoce. Naknade ne utiču na urednički sud.',
    d3: 'Analitika se koristi da razumemo saobraćaj i unapredimo sajt. Ne prodajemo lične podatke. Svoj pristanak za analitiku/oglase možeš izmeniti u bilo kom trenutku.',
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = (TEXT as any)[locale] ?? TEXT.en;

  const path = `/${locale}/about`;
  const languages = Object.fromEntries(
    LOCALES.map((l) => [l, `${SITE}/${l}/about`]),
  );

  return {
    title: t.title,
    description: t.desc,
    alternates: {
      canonical: `${SITE}${path}`,
      languages,
    },
    openGraph: {
      title: t.title,
      description: t.desc,
      url: `${SITE}${path}`,
      siteName: 'InfoHelm',
      type: 'website',
      images: [`${SITE}/og.jpg`],
    },
    twitter: {
      card: 'summary_large_image',
      title: t.title,
      description: t.desc,
      images: [`${SITE}/og.jpg`],
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = (TEXT as any)[locale] ?? TEXT.en;

  const hrefHome = `/${locale}`;
  const safeLocale: Locale = (['en', 'es', 'sr'] as const).includes(locale as Locale)
    ? (locale as Locale)
    : 'en';

  const url = `${SITE}/${safeLocale}/about`;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      {/* GLAVNI NASLOV – zlato + carbon traka u light modu */}
      <h1 className="gold-heading text-3xl font-semibold tracking-tight">
        {t.title}
      </h1>

      {/* Uvodni tekst – about-body + lagano povećan line-height */}
      <p className="about-body mt-2 leading-relaxed">
        {t.desc}
      </p>

      {/* Disclosure sekcija (anchor za footer link) u carbon kartici */}
      <section id="disclosure" className="mt-10 card-carbon p-5 sm:p-6">
        <h2 className="gold-heading text-xl font-semibold tracking-tight">
          {t.disclosureTitle}
        </h2>
        <div className="about-body mt-3 space-y-3 leading-relaxed text-sm sm:text-base">
          <p>{t.d1}</p>
          <p>{t.d2}</p>
          <p>{t.d3}</p>
        </div>
      </section>

      <div className="mt-8">
        <Link href={hrefHome} className="text-brand-gold hover:text-yellow-300 hover:underline transition-colors">
          {t.back}
        </Link>
      </div>

      {/* JSON-LD (Article) */}
      <SeoJsonLd
        type="Article"
        locale={safeLocale}
        url={url}
        title={t.title}
        description={t.desc}
        datePublished="2025-11-01"
        dateModified="2025-11-11"
        authorName="InfoHelm Team"
        images={[`${SITE}/og.jpg`]}
        section="about"
        tags={['about', 'infohelm', 'portal']}
      />
    </main>
  );
}
