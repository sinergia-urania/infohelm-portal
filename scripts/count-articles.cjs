// scripts/count-articles.cjs
const { readdir } = require("node:fs/promises");
const path = require("node:path");

const contentRoot = path.join(process.cwd(), "content"); 
// Struktura: content/<locale>/<category>/<slug>.mdx

async function walk(dir, acc = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full, acc);
    } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
      acc.push(full);
    }
  }
  return acc;
}

(async () => {
  const files = await walk(contentRoot);

  // Map(locale -> Map(category -> count))
  const byLocale = new Map();

  for (const file of files) {
    const rel = path.relative(contentRoot, file);
    const parts = rel.split(path.sep); // [ 'sr', 'crypto-economy', 'slug.mdx' ]

    const locale = parts[0];
    const category = parts[1] ?? "unknown";

    if (!byLocale.has(locale)) {
      byLocale.set(locale, new Map());
    }
    const catMap = byLocale.get(locale);
    catMap.set(category, (catMap.get(category) ?? 0) + 1);
  }

  const total = files.length;
  console.log(`Total articles: ${total}\n`);

  for (const [locale, catMap] of byLocale) {
    let localeTotal = 0;
    for (const count of catMap.values()) localeTotal += count;
    console.log(`Locale: ${locale} (${localeTotal})`);

    for (const [category, count] of catMap) {
      console.log(`  - ${category}: ${count}`);
    }
    console.log("");
  }
})();
