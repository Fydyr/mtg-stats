async function testCdn() {
  // Let's test a few common Cardmarket static CDN paths
  // Cardmarket idProduct for Midnight Hunt Draft Booster Box is e.g. 575306 or similar
  const testIds = [210067, 575306, 200021, 650000];
  const prefixes = [
    (id) => `https://static.cardmarket.com/img/products/${id}.jpg`,
    (id) => `https://static.cardmarket.com/img/products/${id}/${id}.jpg`,
    (id) => `https://static.cardmarket.com/img/items/7/${id}.jpg`,
    (id) => `https://static.cardmarket.com/img/items/1/${id}.jpg`,
    (id) => `https://static.cardmarket.com/img/cards/${id}.jpg`,
    (id) => `https://static.cardmarket.com/img/expansions/${id}.png`,
  ];

  for (const id of testIds) {
    for (const p of prefixes) {
      const url = p(id);
      try {
        const res = await fetch(url, { method: 'HEAD' });
        if (res.status === 200) {
          console.log('SUCCESS:', url, res.headers.get('content-type'));
        }
      } catch (e) {}
    }
  }
}
testCdn();
