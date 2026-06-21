const axios = require('axios');

const keys = [
  '9f36aeafbe60771e321a7cc95a78140772ab3e96',
  '99ab6946a29dfe1a47ac148e9d2d6f831b07c9f5',
  'a5ae7fb188e78581614e4909f407462d8392b977',
  'c6b68aaef0eac4df4931aae70500b7056531cb37',
  'f243534b5ca3483ec8278d1f0833c1dd0334ca66'
];

async function testKey(key) {
  const url = `https://redsky.target.com/redsky_aggregations/v1/web/plp_search_v1?key=${key}&channel=WEB&count=5&keyword=milk&offset=0&pricing_store_id=1406`;
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
      },
      timeout: 3000
    });
    console.log(`Key ${key} SUCCESS!`);
    console.log('Result type:', typeof res.data);
    // Print data structure keys or a tiny slice of data
    if (res.data && res.data.data) {
      console.log('Data keys:', Object.keys(res.data.data));
      if (res.data.data.search) {
        console.log('Search products count:', res.data.data.search.products ? res.data.data.search.products.length : 0);
        if (res.data.data.search.products && res.data.data.search.products.length > 0) {
          const prod = res.data.data.search.products[0];
          console.log('Sample product:', JSON.stringify(prod, null, 2).slice(0, 1000));
        }
      }
    }
    return true;
  } catch (err) {
    console.log(`Key ${key} failed:`, err.message);
    return false;
  }
}

async function run() {
  for (const key of keys) {
    const ok = await testKey(key);
    if (ok) break;
  }
}

run();
