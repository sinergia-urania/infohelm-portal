// components/SeoJsonLd.tsx
"use client";

import React from "react";

type BaseProps = {
  type?: "Article" | "NewsArticle" | "Review";
  locale: "en" | "es" | "sr";
  url: string;                 // canonical URL (apsolutni ili relativni)
  title: string;
  description?: string;
  datePublished?: string;      // ISO
  dateModified?: string;       // ISO
  authorName?: string;
  images?: string[];           // apsolutni ili relativni URL-ovi
  section?: string;            // category/section
  tags?: string[];
  // Dodatno
  publisherName?: string;      // default "InfoHelm"
  publisherLogo?: string;      // default /og.png
  sameAs?: string[];           // npr. društvene mreže izdavača
  isAccessibleForFree?: boolean;
  breadcrumbs?: Array<{ name: string; url: string }>;
};

type ReviewBits = {
  rating?: {
    ratingValue: number;
    best?: number;     // default 5
    worst?: number;    // default 1
    reviewCount?: number;
  };
  itemReviewed?: {
    name: string;
    brand?: string;
  };
};

type Props = BaseProps & ReviewBits;

export default function SeoJsonLd(props: Props) {
  const {
    type = "Article",
    locale,
    url,
    title,
    description,
    datePublished,
    dateModified,
    authorName,
    images = [],
    section,
    tags = [],
    rating,
    itemReviewed,
    publisherName = "InfoHelm",
    publisherLogo = "/og.png",
    sameAs,
    isAccessibleForFree = true,
    breadcrumbs
  } = props;

  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://tech.infohelm.org").replace(/\/+$/, "");

  // Helperi
  const abs = (u: string) => (u.startsWith("http://") || u.startsWith("https://") ? u : `${site}${u.startsWith("/") ? "" : "/"}${u}`);
  const absImages = (arr: string[]) => (arr.length ? arr.map(abs) : [`${site}/og.jpg`]);
  const absUrl = abs(url);

  // Bazni objekat (važi za sva tri tipa)
  const base: any = {
    "@context": "https://schema.org",
    "@type": type,
    headline: title,
    name: title,                      // dodatni alias za neka parsiranja
    inLanguage: locale,
    mainEntityOfPage: absUrl,
    url: absUrl,
    publisher: {
      "@type": "Organization",
      name: publisherName,
      url: site,
      logo: { "@type": "ImageObject", url: abs(publisherLogo) },
      ...(sameAs?.length ? { sameAs } : {})
    }
  };

  if (description) base.description = description;
  if (datePublished) base.datePublished = datePublished;
  if (dateModified) base.dateModified = dateModified;
  if (authorName) base.author = { "@type": "Person", name: authorName };
  if (images.length) base.image = absImages(images);
  if (section) base.articleSection = section;
  if (tags.length) {
    base.keywords = tags.join(", ");
    base.about = tags.map((t) => ({ "@type": "Thing", name: t }));
  }

  // NewsArticle – par preporučenih polja
  if (type === "NewsArticle") {
    base.isAccessibleForFree = isAccessibleForFree;
    // Često se navodi i kao ["NewsArticle", "Article"]
    base["@type"] = ["NewsArticle", "Article"];
  }

  // Review – Product + Rating (+ AggregateRating ako ima reviewCount)
  if (type === "Review" && itemReviewed) {
    base.itemReviewed = {
      "@type": "Product",
      name: itemReviewed.name,
      ...(itemReviewed.brand ? { brand: { "@type": "Brand", name: itemReviewed.brand } } : {})
    };
    if (rating) {
      base.reviewRating = {
        "@type": "Rating",
        ratingValue: rating.ratingValue,
        bestRating: rating.best ?? 5,
        worstRating: rating.worst ?? 1
      };
      if (rating.reviewCount) {
        base.aggregateRating = {
          "@type": "AggregateRating",
          ratingValue: rating.ratingValue,
          ratingCount: rating.reviewCount
        };
      }
    }
  }

  // Ako nisu prosleđene slike, dodaj fallback
  if (!base.image) {
    base.image = [`${site}/og.jpg`];
  }

  const scripts: React.ReactNode[] = [
    <script key="main" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(base) }} />
  ];

  // BreadcrumbList (opciono)
  if (breadcrumbs && breadcrumbs.length) {
    const breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((b, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: b.name,
        item: abs(b.url)
      }))
    };
    scripts.push(
      <script key="breadcrumbs" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
    );
  }

  return <>{scripts}</>;
}
