// Submits every URL in the live sitemap to IndexNow (fans out to Bing, Yandex, Seznam, Naver).
// Run after a deploy: `npm run indexnow`. Key file lives at public/<INDEXNOW_KEY>.txt.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.dailycalculations.com';
const INDEXNOW_KEY = '1e8e7bcb80834c418798fdbe5dd40e40';

async function main() {
  const sitemapRes = await fetch(`${SITE_URL}/sitemap.xml`);
  if (!sitemapRes.ok) {
    throw new Error(`Failed to fetch sitemap: ${sitemapRes.status} ${sitemapRes.statusText}`);
  }
  const sitemapXml = await sitemapRes.text();
  const urlList = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);

  if (urlList.length === 0) {
    throw new Error('No <loc> entries found in sitemap.xml');
  }

  const body = {
    host: new URL(SITE_URL).host,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList
  };

  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body)
  });

  console.log(`Submitted ${urlList.length} URLs — IndexNow responded ${res.status} ${res.statusText}`);
  if (!res.ok) {
    console.log(await res.text());
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
