async function check() {
  const url = 'https://www.cardmarket.com/fr/Magic/Products/Booster-Boxes/Innistrad-Midnight-Hunt-Draft-Booster-Box';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
  const html = await res.text();
  const m = html.match(/https:\/\/[^"']*(?:items|products|cards)[^"']*\.(?:jpg|png|webp)/gi);
  console.log('Matches:', m);
  const ogImg = html.match(/property="og:image"\s+content="([^"]+)"/i) || html.match(/content="([^"]+)"\s+property="og:image"/i);
  console.log('og:image:', ogImg?.[1]);
}
check();
