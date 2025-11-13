// src/app/opensearch.xml/route.ts
import { NextResponse } from 'next/server';

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.infohelm.org').replace(/\/+$/, '');
let HOST = 'www.infohelm.org';
try { HOST = new URL(SITE).hostname; } catch {}

export function GET() {
  // HTML rezultati idu na Google sa "site:domain" filterom (radi čak i bez interne /search strane)
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">
  <ShortName>InfoHelm</ShortName>
  <LongName>InfoHelm Tech — Search</LongName>
  <Description>Search InfoHelm Tech articles (tech • AI • crypto • science).</Description>
  <InputEncoding>UTF-8</InputEncoding>
  <OutputEncoding>UTF-8</OutputEncoding>
  <Language>en</Language>
  <Language>es</Language>
  <Language>sr</Language>
  <SyndicationRight>open</SyndicationRight>
  <AdultContent>false</AdultContent>
  <Image height="64" width="64" type="image/png">${SITE}/icons/icon-192.png</Image>
  <Url type="text/html"
       method="get"
       template="https://www.google.com/search?q=site:${HOST}+{searchTerms}"/>
  <Query role="example" searchTerms="AI Tarot"/>
</OpenSearchDescription>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/opensearchdescription+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
