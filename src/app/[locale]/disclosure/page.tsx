// src/app/[locale]/disclosure/page.tsx
import type { Metadata } from 'next';

const TEXT = {
  en: {
    title: 'Affiliate & Disclosure',
    desc: 'Transparency about affiliate links, recommendations and data use.',
    p1: 'Some articles include affiliate links. If you click and purchase, we may earn a small commission at no extra cost to you.',
    p2: 'Our recommendations are independent and based on usefulness for readers. Compensation does not influence our editorial verdicts.',
    p3: 'Analytics are used to understand traffic and improve the site. Personal data for ads is not sold.',
    p4: 'AI-generated content is reviewed by a human editor before publication where applicable.',
  },
  es: {
    title: 'Afiliados y divulgación',
    desc: 'Transparencia sobre enlaces de afiliados, recomendaciones y uso de datos.',
    p1: 'Algunos artículos incluyen enlaces de afiliados. Si compras tras hacer clic, podemos recibir una pequeña comisión sin coste adicional para ti.',
    p2: 'Nuestras recomendaciones son independientes y basadas en la utilidad para los lectores. La compensación no influye en el veredicto editorial.',
    p3: 'Usamos analíticas para entender el tráfico y mejorar el sitio. No vendemos datos personales para anuncios.',
    p4: 'El contenido generado por IA se revisa por un editor humano cuando corresponde.',
  },
  sr: {
    title: 'Affiliate i obaveštenje',
    desc: 'Transparentno o affiliate linkovima, preporukama i upotrebi podataka.',
    p1: 'Pojedini tekstovi sadrže affiliate linkove. Ako klikneš i obaviš kupovinu, možemo dobiti malu proviziju bez dodatnog troška za tebe.',
    p2: 'Preporuke su nezavisne i zasnovane na korisnosti za čitaoce. Naknade ne utiču na urednički sud.',
    p3: 'Analitika se koristi da razumemo saobraćaj i unapredimo sajt. Ne prodajemo lične podatke za oglase.',
    p4: 'Sadržaj koji generiše AI po potrebi pregleda urednik pre objave.',
  },
} as const;

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tech.infohelm.org').replace(/\/$/, '');

export async function generateMetadata({ params }: { params: Promise<{ locale: keyof typeof TEXT }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = TEXT[locale] ?? TEXT.en;
  const url = `${SITE}/${locale}/disclosure`;
  return {
    title: t.title,
    description: t.desc,
    alternates: {
      canonical: url,
      languages: {
        en: `${SITE}/en/disclosure`,
        es: `${SITE}/es/disclosure`,
        sr: `${SITE}/sr/disclosure`,
        'x-default': `${SITE}/en/disclosure`,
      },
    },
    openGraph: { title: t.title, description: t.desc, url, images: ['/og.png'] },
    twitter: { card: 'summary_large_image', title: t.title, description: t.desc, images: ['/og.png'] },
  };
}

export default async function DisclosurePage({ params }: { params: Promise<{ locale: keyof typeof TEXT }> }) {
  const { locale } = await params;
  const t = TEXT[locale] ?? TEXT.en;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t.title}</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-300">{t.desc}</p>

      <div className="mt-6 space-y-4 text-zinc-700 dark:text-zinc-300">
        <p>{t.p1}</p>
        <p>{t.p2}</p>
        <p>{t.p3}</p>
        <p>{t.p4}</p>
      </div>
    </main>
  );
}
